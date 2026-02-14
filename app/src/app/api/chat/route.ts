import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, UPDATE_CHARACTER_TOOL } from "@/lib/system-prompt";
import type { Character, ChatMessage } from "@/types/character";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const { messages, character }: { messages: ChatMessage[]; character: Character } =
    await request.json();

  const systemPrompt = buildSystemPrompt(character);

  const anthropicMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 1024,
          system: systemPrompt,
          tools: [UPDATE_CHARACTER_TOOL],
          messages: anthropicMessages,
          stream: true,
        });

        let currentText = "";
        let toolUseId = "";
        let toolInput = "";
        let actualToolUseId = "";
        let characterUpdates: Record<string, unknown> | null = null;

        for await (const event of response) {
          if (event.type === "content_block_start") {
            if (event.content_block.type === "tool_use") {
              toolUseId = event.content_block.id;
              actualToolUseId = event.content_block.id;
              toolInput = "";
            }
          } else if (event.type === "content_block_delta") {
            if (event.delta.type === "text_delta") {
              currentText += event.delta.text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`
                )
              );
            } else if (event.delta.type === "input_json_delta") {
              toolInput += event.delta.partial_json;
            }
          } else if (event.type === "content_block_stop" && toolUseId) {
            try {
              characterUpdates = JSON.parse(toolInput);
              console.log("[chat] Tool call received:", JSON.stringify(characterUpdates, null, 2));
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "character_update", updates: characterUpdates })}\n\n`
                )
              );
            } catch (parseError) {
              console.error("[chat] Failed to parse tool input:", toolInput, parseError);
            }
            toolUseId = "";
          } else if (event.type === "message_stop") {
            // If the model used a tool, we need to send back the tool result
            // and get the follow-up text response
            if (characterUpdates) {
              const followUp = await anthropic.messages.create({
                model: "claude-sonnet-4-5-20250929",
                max_tokens: 1024,
                system: systemPrompt,
                tools: [UPDATE_CHARACTER_TOOL],
                messages: [
                  ...anthropicMessages,
                  {
                    role: "assistant",
                    content: [
                      ...(currentText
                        ? [{ type: "text" as const, text: currentText }]
                        : []),
                      {
                        type: "tool_use" as const,
                        id: actualToolUseId,
                        name: "update_character",
                        input: characterUpdates,
                      },
                    ],
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "tool_result" as const,
                        tool_use_id: actualToolUseId,
                        content: "Character updated successfully.",
                      },
                    ],
                  },
                ],
                stream: true,
              });

              for await (const followEvent of followUp) {
                if (
                  followEvent.type === "content_block_delta" &&
                  followEvent.delta.type === "text_delta"
                ) {
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "text", text: followEvent.delta.text })}\n\n`
                    )
                  );
                }
              }
            }
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An error occurred";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
