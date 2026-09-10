// lib/renderProfile.js

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   SOCIAL MEDIA CONFIG
========================================================= */

const PLATFORM_CONFIG = {
  Instagram: {
    prefix: "instagram.com/",
    build: (v) => `https://instagram.com/${clean(v)}`
  },

  TikTok: {
    prefix: "tiktok.com/@",
    build: (v) => `https://tiktok.com/@${clean(v)}`
  },

  X: {
    prefix: "x.com/",
    build: (v) => `https://x.com/${clean(v)}`
  },

  YouTube: {
    prefix: "youtube.com/@",
    build: (v) => `https://youtube.com/@${clean(v)}`
  },

  WhatsApp: {
    prefix: "wa.me/",
    build: (v) => {
      const number = String(v || "").replace(/\D/g, "");
      return number ? `https://wa.me/${number}` : "";
    }
  },

  Telegram: {
    prefix: "t.me/",
    build: (v) => `https://t.me/${clean(v)}`
  },

  Discord: {
    prefix: "",
    build: (v) => {
      const value = String(v || "").trim();

      if (!value) return "";

      if (/^https?:\/\//i.test(value)) {
        return value;
      }

      const cleaned = clean(value);

      if (/^discord\.gg\//i.test(cleaned)) {
        return `https://${cleaned}`;
      }

      return `https://discord.gg/${cleaned}`;
    }
  },

  Facebook: {
    prefix: "facebook.com/",
    build: (v) => `https://facebook.com/${clean(v)}`
  },

  Website: {
    prefix: "",
    build: (v) => {
      const value = String(v || "").trim();

      if (!value) return "";

      if (/^https?:\/\//i.test(value)) {
        return value;
      }

      if (/^www\./i.test(value)) {
        return `https://${value}`;
      }

      return `https://${value}`;
    }
  },

  Custom: {
    prefix: "",
    build: (v) => {
      const value = String(v || "").trim();

      if (!value) return "";

      if (/^https?:\/\//i.test(value)) {
        return value;
      }

      if (/^www\./i.test(value)) {
        return `https://${value}`;
      }

      return `https://${value}`;
    }
  }
};


/* =========================================================
   CLEAN VALUE
========================================================= */

function clean(value) {
  return String(value || "")
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}


/* =========================================================
   BUILD SOCIAL URL
========================================================= */

function buildSocialUrl(platform, rawValue) {
  const value = String(rawValue || "").trim();

  if (!value) {
    return "";
  }

  /*
    If the user already saved a complete URL,
    preserve it.
  */

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^www\./i.test(value)) {
    return `https://${value}`;
  }

  const config =
    PLATFORM_CONFIG[platform] ||
    PLATFORM_CONFIG.Custom;

  return config.build(value);
}


/* =========================================================
   DISPLAY SUBTITLE
========================================================= */

function displaySubtitle(platform, value) {
  if (!value) return "";

  const raw = String(value).trim();

  /*
    If old data contains a full URL,
    show the domain/path instead of rebuilding it.
  */

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);

      return (
        url.hostname +
        url.pathname
      ).replace(/\/$/, "");
    } catch {
      return raw;
    }
  }

  const config =
    PLATFORM_CONFIG[platform] ||
    PLATFORM_CONFIG.Custom;

  if (config.prefix) {
    return config.prefix + clean(raw);
  }

  return clean(raw);
}


/* =========================================================
   NORMALIZE ONE LINK
========================================================= */

function normalizeLink(link) {
  if (!link) {
    return null;
  }

  /*
    Supports:

    ["Instagram", "username"]

    {
      platform: "Instagram",
      value: "username"
    }

    {
      platform: "Instagram",
      url: "https://instagram.com/username"
    }
  */

  if (Array.isArray(link)) {
    return {
      platform: link[0] || "Custom",
      value: String(link[1] || "").trim()
    };
  }

  if (typeof link === "object") {
    return {
      platform:
        link.platform ||
        link.type ||
        "Custom",

      value: String(
        link.value ??
        link.url ??
        link.link ??
        ""
      ).trim()
    };
  }

  return null;
}


/* =========================================================
   NORMALIZE ALL LINKS
========================================================= */

function normalizeLinks(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeLink)
    .filter(Boolean);
}


/* =========================================================
   PLATFORM ICONS
========================================================= */

const PLATFORM_ICONS = {
  Instagram: "◎",
  TikTok: "♪",
  X: "𝕏",
  YouTube: "▶",
  WhatsApp: "◉",
  Telegram: "➤",
  Discord: "◈",
  Facebook: "f",
  Website: "↗",
  Custom: "↗"
};


/* =========================================================
   LINK ROW
========================================================= */

function linkRow(link) {
  const platform =
    link.platform ||
    link.type ||
    "Custom";

  const value =
    String(
      link.value ??
      link.url ??
      link.link ??
      ""
    ).trim();

  /*
    Empty links should NOT point to "#".

    "#" causes the page to reload/jump,
    which can look like the website duplicated itself.
  */

  const href = buildSocialUrl(
    platform,
    value
  );

  const title = platform;

  const subtitle =
    displaySubtitle(
      platform,
      value
    );

  const icon =
    PLATFORM_ICONS[platform] ||
    PLATFORM_ICONS.Custom;

  /*
    If there is no valid URL,
    render a normal div instead of
    an <a href="#">
  */

  if (!href) {
    return `
      <div class="linkRow">
        <div class="linkIcon">
          ${esc(icon)}
        </div>

        <div class="linkInfo">
          <div class="linkTitle">
            ${esc(title)}
          </div>

          ${
            subtitle
              ? `
                <div class="linkSubtitle">
                  ${esc(subtitle)}
                </div>
              `
              : ""
          }
        </div>
      </div>
    `;
  }

  return `
    <a
      class="linkRow"
      href="${esc(href)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="linkIcon">
        ${esc(icon)}
      </div>

      <div class="linkInfo">
        <div class="linkTitle">
          ${esc(title)}
        </div>

        ${
          subtitle
            ? `
              <div class="linkSubtitle">
                ${esc(subtitle)}
              </div>
            `
            : ""
        }
      </div>

      <div class="linkArrow">
        ↗
      </div>
    </a>
  `;
}


/* =========================================================
   PROFILE HTML
========================================================= */

function renderProfileHTML(profile) {

  if (!profile) {
    return {
      html: `
        <div style="
          font-family:Arial,sans-serif;
          padding:40px;
          text-align:center;
        ">
          <h2>Profile not found</h2>
        </div>
      `
    };
  }

  /*
    IMPORTANT:

    Normalize the links here so the public profile
    understands both old and new saved formats.
  */

  const links = normalizeLinks(
    profile.data &&
    profile.data.links
  );

  const gallery =
    Array.isArray(
      profile.data &&
      profile.data.gallery
    )
      ? profile.data.gallery
      : [];


  const name =
    profile.name ||
    "gave. profile";

  const bio =
    profile.bio ||
    "";

  const avatar =
    profile.avatar_url ||
    "";


  /* =======================================================
     SOCIAL LINKS
  ======================================================= */

  const linksHTML = links
    .map(linkRow)
    .join("");


  /* =======================================================
     GALLERY
  ======================================================= */

  const galleryHTML =
    gallery.length
      ? `
        <div class="gallery">
          ${gallery
            .map(
              (image) => `
                <div class="galleryItem">
                  <img
                    src="${esc(
                      typeof image === "string"
                        ? image
                        : image.url || ""
                    )}"
                    alt=""
                    loading="lazy"
                  />
                </div>
              `
            )
            .join("")}
        </div>
      `
      : "";


  /* =======================================================
     AVATAR
  ======================================================= */

  const avatarHTML = avatar
    ? `
      <div class="avatar">
        <img
          src="${esc(avatar)}"
          alt=""
        />
      </div>
    `
    : `
      <div class="avatar avatarFallback">
        ${esc(
          name
            .trim()
            .charAt(0)
            .toUpperCase()
        )}
      </div>
    `;


  /* =======================================================
     FULL PROFILE PAGE
  ======================================================= */

  const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    ${esc(name)} — gave.
  </title>

  <style>

    * {
      box-sizing: border-box;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      min-height: 100%;
    }

    body {
      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "SF Pro Display",
        "SF Pro Text",
        "Helvetica Neue",
        Arial,
        sans-serif;

      background:
        #f5f5f7;

      color:
        #111;

      -webkit-font-smoothing:
        antialiased;
    }

    .page {
      min-height: 100vh;
      padding: 28px 18px 50px;
    }

    .container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
    }

    .brand {
      text-align: center;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 28px;
    }

    .profileHeader {
      text-align: center;
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin: 0 auto 18px;
      overflow: hidden;
      background: #e5e5e7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      font-weight: 700;
    }

    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .name {
      font-size: 30px;
      line-height: 1.1;
      font-weight: 700;
      letter-spacing: -1.2px;
      margin: 0;
    }

    .bio {
      margin: 12px auto 0;
      max-width: 420px;
      font-size: 15px;
      line-height: 1.55;
      color: #666;
      white-space: pre-wrap;
    }

    .links {
      margin-top: 28px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .linkRow {
      width: 100%;
      min-height: 68px;
      padding: 13px 15px;

      display: flex;
      align-items: center;
      gap: 13px;

      border-radius: 18px;

      background: rgba(255,255,255,.82);

      border: 1px solid rgba(0,0,0,.06);

      color: inherit;
      text-decoration: none;

      box-shadow:
        0 5px 20px rgba(0,0,0,.04);

      transition:
        transform .15s ease,
        box-shadow .15s ease;
    }

    a.linkRow:active {
      transform: scale(.98);
    }

    .linkIcon {
      width: 42px;
      height: 42px;
      flex: 0 0 42px;

      border-radius: 13px;

      background: #111;
      color: white;

      display: flex;
      align-items: center;
      justify-content: center;

      font-size: 20px;
      font-weight: 700;
    }

    .linkInfo {
      min-width: 0;
      flex: 1;
    }

    .linkTitle {
      font-size: 16px;
      font-weight: 650;
      line-height: 1.2;
    }

    .linkSubtitle {
      margin-top: 4px;

      font-size: 13px;
      color: #777;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .linkArrow {
      font-size: 19px;
      color: #888;
      flex: 0 0 auto;
    }

    .gallery {
      margin-top: 28px;

      display: grid;
      grid-template-columns:
        repeat(2, minmax(0, 1fr));

      gap: 10px;
    }

    .galleryItem {
      overflow: hidden;
      border-radius: 18px;
      background: #e5e5e7;
      aspect-ratio: 1 / 1;
    }

    .galleryItem img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .footer {
      text-align: center;
      margin-top: 35px;
      color: #999;
      font-size: 12px;
    }

    .footer strong {
      color: #111;
    }


    /* =====================================================
       DARK MODE
    ===================================================== */

    @media (prefers-color-scheme: dark) {

      body {
        background: #000;
        color: #fff;
      }

      .brand {
        color: #fff;
      }

      .bio {
        color: #999;
      }

      .linkRow {
        background: #171717;
        border-color: rgba(255,255,255,.08);
        box-shadow: none;
      }

      .linkIcon {
        background: #fff;
        color: #000;
      }

      .linkSubtitle {
        color: #999;
      }

      .linkArrow {
        color: #777;
      }

      .avatar {
        background: #222;
      }

      .footer {
        color: #666;
      }

      .footer strong {
        color: #fff;
      }
    }

  </style>

</head>


<body>

  <main class="page">

    <div class="container">

      <div class="brand">
        gave.
      </div>

      <section class="profileHeader">

        ${avatarHTML}

        <h1 class="name">
          ${esc(name)}
        </h1>

        ${
          bio
            ? `
              <div class="bio">
                ${esc(bio)}
              </div>
            `
            : ""
        }

      </section>


      ${
        links.length
          ? `
            <section class="links">
              ${linksHTML}
            </section>
          `
          : ""
      }


      ${galleryHTML}


      <div class="footer">
        Powered by <strong>gave.</strong>
      </div>

    </div>

  </main>

</body>

</html>
  `;

  return {
    html
  };
}


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  renderProfileHTML
};