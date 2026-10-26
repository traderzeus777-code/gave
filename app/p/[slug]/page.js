import { createClient } from "@supabase/supabase-js";
import { renderProfileHTML } from "../../../lib/renderProfile";
import EditButton from "./EditButton";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Cache each public profile at the edge; a tap storm hits the cache, not Supabase.
export const revalidate = 30;

export default async function ProfilePage({ params }) {
  const { slug } = await params;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!profile) {
    return (
      <div style={{ padding: 60, textAlign: "center", fontFamily: "sans-serif" }}>
        <h1>Profile not found</h1>
      </div>
    );
  }

  if (profile.is_private) {
    return (
      <div style={{ padding: 60, textAlign: "center", fontFamily: "sans-serif" }}>
        <h1>This profile is private</h1>
      </div>
    );
  }

  // Look up the short_code so a signed-in owner can jump back into the builder.
  // ASSUMPTION: cards.profile_id references profiles.id — adjust if your column differs.
  const { data: card } = await supabaseAdmin
    .from("cards")
    .select("short_code")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { html } = renderProfileHTML(profile);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PROFILE_CSS }} />
      <div className="page">
  <div className="card">
    <div dangerouslySetInnerHTML={{ __html: html }} />
    <EditButton ownerId={profile.owner_id} shortCode={card?.short_code} />
  </div>
</div>
    </>
  );
}

const PROFILE_CSS = `
:root{
  --black:#000000;
  --ink:#1d1d1f;
  --white:#ffffff;
  --fog:#f5f5f7;
  --line:#e5e5ea;
  --steel:#86868b;
}
*{box-sizing:border-box}
body{
  margin:0;
  background:var(--fog);
  min-height:100vh;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text",Inter,Helvetica,Arial,sans-serif;
  color:var(--ink);
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none}
.page{display:flex;justify-content:center;padding:56px 18px 60px}
.card{width:100%;max-width:420px;text-align:center}

.avatarWrap{display:flex;justify-content:center;margin-bottom:20px}
.avatar{width:104px;height:104px;border-radius:50%;overflow:hidden;background:var(--black);display:grid;place-items:center;color:var(--white);font-weight:600;font-size:28px;letter-spacing:-.02em;box-shadow:0 0 0 1px rgba(0,0,0,.04)}
.avatar img{width:100%;height:100%;object-fit:cover}

.pName{font-size:26px;font-weight:700;color:var(--black);margin:0 0 5px;letter-spacing:-.03em;line-height:1.2}
.pBio{font-size:14px;color:var(--steel);line-height:1.5;max-width:290px;margin:0 auto 30px;font-weight:500}

.linkList{display:flex;flex-direction:column;gap:10px}
.linkRow{
  display:flex;align-items:center;gap:13px;
  background:var(--white);
  border:1px solid var(--line);
  border-radius:16px;
  padding:13px 16px;
  transition:border-color .15s, transform .1s;
}
.linkRow:active{transform:scale(.985)}
.linkBadge{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:var(--black);color:#fff}
.linkBadge svg{width:17px;height:17px}
.linkText{flex:1;display:flex;flex-direction:column;text-align:left;min-width:0}
.linkTitle{font-size:14.5px;font-weight:600;color:var(--ink);letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.linkSubtitle{font-size:12px;color:var(--steel);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.linkChevron{flex-shrink:0;opacity:.25}
.linkChevron svg{width:9px;height:9px}

.emptyState{padding:30px 20px;border:1px dashed var(--line);border-radius:16px;color:var(--steel);font-size:13px;line-height:1.5}

.poweredBy{display:inline-block;margin-top:32px;font-size:11px;color:var(--steel);font-weight:500;letter-spacing:.01em}

.editBtn{
  display:inline-block;
  margin-top:22px;
  font-size:13px;
  font-weight:600;
  color:var(--white);
  background:var(--black);
  padding:10px 20px;
  border-radius:999px;
}
`;