import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// GET /api/characters — list user's saved characters
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/characters — save a new character
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("characters")
    .insert({
      user_id: user.id,
      name: body.name || "",
      race: body.race || "",
      class: body.class || "",
      level: body.level || 1,
      ability_scores: body.abilityScores || {
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      },
      hit_points: body.hitPoints || 0,
      proficiencies: body.proficiencies || [],
      equipment: body.equipment || [],
      background: body.background || "",
      backstory: body.backstory || "",
      appearance: body.appearance || "",
      edition: body.edition || "5e",
      chat_history: body.chatHistory || [],
      portrait_url: body.portraitUrl || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/characters — update an existing character
export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "Character ID required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("characters")
    .update({
      name: body.name,
      race: body.race,
      class: body.class,
      level: body.level,
      ability_scores: body.abilityScores,
      hit_points: body.hitPoints,
      proficiencies: body.proficiencies,
      equipment: body.equipment,
      background: body.background,
      backstory: body.backstory,
      appearance: body.appearance,
      edition: body.edition,
      chat_history: body.chatHistory || [],
      portrait_url: body.portraitUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/characters — delete a character
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Character ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
