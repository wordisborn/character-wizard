import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

export const maxDuration = 60;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Map race+class to the closest static portrait for style reference
const PORTRAITS = [
  { race: "halfling", class: "rogue", file: "halfling-rogue.png" },
  { race: "human", class: "fighter", file: "human-fighter.png" },
  { race: "elf", class: "ranger", file: "elf-ranger.png" },
  { race: "dwarf", class: "cleric", file: "dwarf-cleric.png" },
  { race: "tiefling", class: "warlock", file: "tiefling-warlock.png" },
  { race: "half-orc", class: "barbarian", file: "halforc-barbarian.png" },
  { race: "dragonborn", class: "paladin", file: "dragonborn-paladin.png" },
  { race: "elf", class: "wizard", file: "elf-wizard.png" },
];

const CLASS_FAMILY: Record<string, string> = {
  sorcerer: "wizard",
  bard: "rogue",
  monk: "fighter",
  druid: "cleric",
};

function findReferencePortrait(race: string, charClass: string): string {
  const r = race.toLowerCase();
  const c = charClass.toLowerCase();

  const exact = PORTRAITS.find((p) => r.includes(p.race) && c === p.class);
  if (exact) return exact.file;

  const classMatch = PORTRAITS.find((p) => c === p.class);
  if (classMatch) return classMatch.file;

  const raceMatch = PORTRAITS.find((p) => r.includes(p.race));
  if (raceMatch) return raceMatch.file;

  if (CLASS_FAMILY[c]) {
    const family = PORTRAITS.find((p) => p.class === CLASS_FAMILY[c]);
    if (family) return family.file;
  }

  return "human-fighter.png";
}

function buildPrompt(character: {
  race: string;
  class: string;
  name: string;
  appearance: string;
  equipment: string[];
}): string {
  const lines = [
    "Stylized 3D low-poly character portrait with soft matte textures, geometric faceted surfaces.",
    "Full body, centered, facing camera.",
    "Low-poly geometric environment matching character theme.",
    "Moody atmospheric lighting with subtle rim light.",
    "NOT photorealistic, NOT 2D illustration.",
    "Must look like a 3D low-poly game render with matte textures and geometric shapes.",
    "",
    `Character: ${character.race} ${character.class}${character.name ? ` named ${character.name}` : ""}`,
  ];

  if (character.appearance) {
    lines.push(`Appearance: ${character.appearance}`);
  }

  if (character.equipment?.length > 0) {
    const items = character.equipment.slice(0, 6).join(", ");
    lines.push(`Equipment: ${items}`);
  }

  return lines.join("\n");
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { character, characterId } = body;

  if (!character?.race || !character?.class) {
    return NextResponse.json(
      { error: "Character needs race and class" },
      { status: 400 }
    );
  }

  try {
    // Read reference portrait for style anchoring
    const refFile = findReferencePortrait(character.race, character.class);
    const refPath = path.join(process.cwd(), "public", "characters", refFile);
    const refBuffer = fs.readFileSync(refPath);
    const refBase64 = refBuffer.toString("base64");

    const prompt = buildPrompt(character);

    // Generate image with OpenAI gpt-image-1
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "high",
    });

    const imageBase64 = response.data?.[0]?.b64_json;
    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    // Upload to Supabase Storage
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const storagePath = `portraits/${user.id}/${characterId || "draft"}.png`;
    const imageBuffer = Buffer.from(imageBase64, "base64");

    const { error: uploadError } = await adminSupabase.storage
      .from("portraits")
      .upload(storagePath, imageBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      // Still return the base64 even if storage fails
      return NextResponse.json({
        base64: `data:image/png;base64,${imageBase64}`,
        portraitUrl: null,
      });
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from("portraits").getPublicUrl(storagePath);

    // Add cache-bust to the URL so browsers pick up new images
    const portraitUrl = `${publicUrl}?v=${Date.now()}`;

    return NextResponse.json({
      base64: `data:image/png;base64,${imageBase64}`,
      portraitUrl,
    });
  } catch (error) {
    console.error("Portrait generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate portrait" },
      { status: 500 }
    );
  }
}
