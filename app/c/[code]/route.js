import { createClient } from "@supabase/supabase-js";
import { NextResponse, after } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;

export async function GET(request, { params }) {
  const { code } = await params;
  const origin = new URL(request.url).origin;

  // Reject junk codes before touching the database.
  if (!CODE_RE.test(code)) {
    return NextResponse.redirect(`${origin}/not-found`);
  }

  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("id, status, profiles(slug)")
    .eq("short_code", code)
    .maybeSingle();

  if (!card) {
    return NextResponse.redirect(`${origin}/not-found`);
  }

  // Log the tap AFTER the redirect is sent, so it never slows the tap and
  // is not dropped when the serverless function freezes.
  const ua = request.headers.get("user-agent") || "";
  const ref = request.headers.get("referer") || "";
  after(async () => {
    try {
      await supabaseAdmin.from("scans").insert({
        card_id: card.id,
        user_agent: ua.slice(0, 300),
        referrer: ref.slice(0, 300),
      });
    } catch (e) {
      console.error("scan log failed", e);
    }
  });

  if (card.status === "disabled") {
    return NextResponse.redirect(`${origin}/disabled`);
  }

  if (card.status === "claimed" && card.profiles?.slug) {
    return NextResponse.redirect(`${origin}/p/${card.profiles.slug}`);
  }

  return NextResponse.redirect(`${origin}/builder.html?code=${encodeURIComponent(code)}`);
}
