import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request, { params }) {
  const { code } = await params;
  const origin = new URL(request.url).origin;

  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("id, status, profiles(slug)")
    .eq("short_code", code)
    .single();

  if (!card) {
    return NextResponse.redirect(`${origin}/not-found`);
  }

  supabaseAdmin.from("scans").insert({
    card_id: card.id,
    user_agent: request.headers.get("user-agent") || "",
    referrer: request.headers.get("referer") || "",
  });

  if (card.status === "disabled") {
    return NextResponse.redirect(`${origin}/disabled`);
  }

  if (card.status === "claimed" && card.profiles?.slug) {
    return NextResponse.redirect(`${origin}/p/${card.profiles.slug}`);
  }

  return NextResponse.redirect(`${origin}/builder.html?code=${code}`);
}