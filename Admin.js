/* ============================================================
   Admin.js  —  Portfolio CMS (Certificates · Projects · Skills)
   No backend · No server · Works on GitHub Pages.
   ============================================================
   SETUP — edit only these two constants:
   ============================================================ */

const SPREADSHEET_ID = "1ASSXeZykE583Me-jSFIjATUfGSsufDyVqY5hF530bn8";
const SHEET_NAME     = "Certificates%20Manager";

const OPENSHEET_URL  = `https://opensheet.elk.sh/${SPREADSHEET_ID}/${SHEET_NAME}`;


/* ============================================================
   COLUMN MAP
   Exact Google Sheet headers (spaces are trimmed automatically).
   ============================================================ */
const COL = {

  // Row classifier: "Add Certificate" | "Add Project" | "Add Skill"
  // Rows with an empty/missing type column → treated as certificates (legacy)
  type         : "What do you want to add?",

  // ── Certificate fields ──────────────────────────────────────
  certTitle    : "Title",
  certIssuer   : "Issuer",
  certDate     : "Date",
  certImage    : "Certificate Image URL",
  certLink     : "Certificate URL",

  // ── Project fields ───────────────────────────────────────────
  projTitle    : "Project Title",
  projCategory : "Project Category",
  projImage    : "Project Image URL",
  projLive     : "Project Live URL",
  projGithub   : "GitHub Repository URL",

  // ── Skill fields ─────────────────────────────────────────────
  skillName    : "Skill",
  skillImage   : "Skill Image URL",
};


/* ============================================================
   normaliseRow
   Trims every key and every string value in a row object.
   Fixes stray spaces such as "Title ", "  Issuer  ", etc.
   ============================================================ */
function normaliseRow(row) {
  const cleaned = {};
  for (const [key, value] of Object.entries(row)) {
    cleaned[key.trim()] = typeof value === "string" ? value.trim() : value;
  }
  return cleaned;
}


/* ============================================================
   getType
   Classifies each row by the value of its type column.

   "Add Project"     → "project"
   "Add Skill"       → "skill"
   "Add Certificate" → "certificate"
   empty / missing   → "certificate"  (legacy rows)
   ============================================================ */
function getType(row) {
  const raw = (row[COL.type] || "").toLowerCase();
  if (raw.includes("project"))     return "project";
  if (raw.includes("skill"))       return "skill";
  if (raw.includes("certificate")) return "certificate";
  return "certificate"; // fallback for legacy rows
}


/* ============================================================
   resolveImage
   Returns a usable image URL from whatever format the sheet
   column contains:
     • Cloudinary https://  → returned as-is
     • Google Drive share   → converted to direct embed URL
   ============================================================ */
function resolveImage(raw) {
  if (!raw) return "";

  // Already a converted Drive embed URL
  if (raw.includes("drive.google.com/uc")) return raw;

  // Drive URL with ?id= query param
  const queryMatch = raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (queryMatch) {
    return `https://drive.google.com/uc?export=view&id=${queryMatch[1]}`;
  }

  // Drive URL with /d/<id>/ path segment
  const pathMatch = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (pathMatch) {
    return `https://drive.google.com/uc?export=view&id=${pathMatch[1]}`;
  }

  // Any other https:// URL — return as-is
  try {
    const url = new URL(raw);
    if (url.protocol === "https:") return raw;
  } catch {
    /* invalid URL — fall through */
  }

  return "";
}


/* ============================================================
   formatDate
   Converts a raw date string into a human-readable label.
   Example: "2023-11-01" → "Nov 2023"
   ============================================================ */
function formatDate(raw) {
  if (!raw) return "";
  const date = new Date(raw);
  if (isNaN(date)) return raw; // return original if unparseable
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}


/* ============================================================
   detectMedia
   Inspects a URL and returns { type, src } where type is one
   of: "youtube" | "video" | "image" | "none".
   ============================================================ */
function detectMedia(raw) {
  if (!raw) return { type: "none", src: "" };

  const url = raw.trim();

  // ── YouTube ──────────────────────────────────────────────────
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      type: "youtube",
      src : `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&rel=0`,
    };
  }

  // ── Cloudinary video ─────────────────────────────────────────
  if (url.includes("cloudinary.com") && url.includes("/video/upload/")) {
    return { type: "video", src: url };
  }

  // ── Direct video file extension ──────────────────────────────
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
    return { type: "video", src: url };
  }

  // ── Cloudinary image (non-video path) ────────────────────────
  if (url.includes("cloudinary.com")) {
    return { type: "image", src: url };
  }

  // ── Image file extension ─────────────────────────────────────
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)) {
    return { type: "image", src: url };
  }

  // ── Fallback: treat as image (handles Drive URLs, etc.) ──────
  return { type: "image", src: resolveImage(url) };
}


/* ============================================================
   buildMediaBlock
   Returns an HTML string for the project card's media area.
   Renders an <iframe>, <video>, or <img> based on URL type.
   ============================================================ */
function buildMediaBlock(raw, title, liveURL) {
  const { type, src } = detectMedia(raw);
  if (type === "none" || !src) return "";

  // ── YouTube embed ────────────────────────────────────────────
  if (type === "youtube") {
    return `
      <div class="proj-video-wrap">
        <iframe
          src="${src}"
          title="${title}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>`;
  }

  // ── HTML5 video ──────────────────────────────────────────────
  if (type === "video") {
    return `
      <div class="proj-video-wrap">
        <video
          src="${src}"
          autoplay
          loop
          muted
          playsinline
          preload="auto"
          onerror="this.parentElement.style.display='none'"
        ></video>
      </div>`;
  }

  // ── Image (optionally wrapped in a link) ─────────────────────
  const imgTag = `
    <img
      src="${src}"
      alt="${title}"
      loading="lazy"
      onerror="this.style.display='none'"
    />`;

  return (liveURL && liveURL !== "#")
    ? `<a href="${liveURL}" target="_blank" rel="noopener noreferrer">${imgTag}</a>`
    : imgTag;
}


/* ============================================================
   buildCertCard
   Returns the HTML for a single certificate timeline entry.
   Alternates between left/right sides based on index parity.
   ============================================================ */
function buildCertCard(row, index) {
  const title     = row[COL.certTitle]  || "Untitled Certificate";
  const issuer    = row[COL.certIssuer] || "";
  const date      = row[COL.certDate]   || "";
  const link      = row[COL.certLink]   || "";
  const imgSrc    = resolveImage(row[COL.certImage] || "");
  const dateLabel = formatDate(date);
  const side      = index % 2 === 0 ? "left" : "right";

  // Image block (linked if a URL is provided)
  let imgBlock = "";
  if (imgSrc) {
    const img = `
      <img
        src="${imgSrc}"
        alt="${title}"
        loading="lazy"
        onerror="this.style.display='none'"
      />`;
    imgBlock = link
      ? `<a href="${link}" target="_blank" rel="noopener noreferrer">${img}</a>`
      : img;
  }

  // Text link fallback when no image exists
  const linkBlock = (link && !imgSrc)
    ? `<a href="${link}" target="_blank" rel="noopener noreferrer">View Certificate ↗</a>`
    : "";

  return `
    <div class="container1 ${side} cert-dynamic">
      <div class="content">
        <h2>${dateLabel ? `Issued ${dateLabel}` : ""}</h2>
        <p>${title}</p>
        <h6>${issuer}</h6>
        ${imgBlock}
        ${linkBlock}
      </div>
    </div>`;
}


/* ============================================================
   buildProjectCard
   Returns the HTML for a single project card.
   ============================================================ */
function buildProjectCard(row) {
  const title    = row[COL.projTitle]    || "Untitled Project";
  const category = row[COL.projCategory] || "Project";
  const liveURL  = row[COL.projLive]     || "#";
  const github   = row[COL.projGithub]   || "";

  const mediaBlock = buildMediaBlock(row[COL.projImage] || "", title, liveURL);

  const githubLink = github
    ? `<a href="${github}" target="_blank" rel="noopener noreferrer">GitHub</a>`
    : "";

  return `
    <div class="project-card proj-dynamic">
      <div class="project-img">
        ${mediaBlock}
      </div>
      <div class="project-info">
        <p class="project-catrgory">${category}</p>
        <strong class="project-title">
          <span>${title}</span>
        </strong>
        ${githubLink}
      </div>
    </div>`;
}


/* ============================================================
   buildSkillCard
   Returns the HTML for a single skill card.
   Matches the exact HTML structure used in the portfolio.
   ============================================================ */
function buildSkillCard(row) {
  const name   = row[COL.skillName]  || "Skill";
  const imgSrc = resolveImage(row[COL.skillImage] || "");

  const imgTag = imgSrc
    ? `<img src="${imgSrc}" alt="${name}" loading="lazy" onerror="this.style.display='none'" />`
    : "";

  return `
    <div class="skills-card skill-dynamic">
      <div class="skills-flex">
        <div class="skills-img">
          ${imgTag}
        </div>
        <div class="skills-info">
          <p class="skills-category">${name}</p>
        </div>
      </div>
    </div>`;
}


/* ============================================================
   loadContent
   Main entry point:
   1. Fetches the Google Sheet via OpenSheet
   2. Classifies every row (certificate / project / skill)
   3. Renders each group into its respective DOM container
   ============================================================ */
async function loadContent() {
  const timelineEl    = document.querySelector(".timeline");
  const projectGridEl = document.querySelector(".project-content");
  const skillsGridEl  = document.querySelector(".skills-content");

  // Nothing to render into — bail out early
  if (!timelineEl && !projectGridEl && !skillsGridEl) {
    console.warn("[CMS] No target containers found in DOM.");
    return;
  }

  // ── Loading placeholders ──────────────────────────────────────
  function makeLoader(text) {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.cssText =
      "text-align:center; color:#888; padding:20px; font-size:14px; grid-column:1/-1;";
    return p;
  }

  const certLoader  = makeLoader("Loading certificates…");
  const projLoader  = makeLoader("Loading projects…");
  const skillLoader = makeLoader("Loading skills…");

  if (timelineEl)    timelineEl.appendChild(certLoader);
  if (projectGridEl) projectGridEl.appendChild(projLoader);
  if (skillsGridEl)  skillsGridEl.appendChild(skillLoader);

  // ── Fetch & render ────────────────────────────────────────────
  try {
    const res = await fetch(OPENSHEET_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const rawRows = await res.json();

    // Remove loaders
    certLoader.remove();
    projLoader.remove();
    skillLoader.remove();

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      console.info("[CMS] Sheet is empty.");
      return;
    }

    // Normalise (trim whitespace from keys/values)
    const rows = rawRows.map(normaliseRow);

    // Classify into three groups
    const certs    = rows.filter(r => getType(r) === "certificate");
    const projects = rows.filter(r => getType(r) === "project");
    const skills   = rows.filter(r => getType(r) === "skill");

    console.log("[CMS] Detected columns →", Object.keys(rows[0]));
    console.log(
      `[CMS] Found: ${certs.length} cert(s), ` +
      `${projects.length} project(s), ${skills.length} skill(s)`
    );

    // ── Certificates — newest first (reverse the array) ──────────
    if (timelineEl && certs.length) {
      [...certs].reverse().forEach((row, i) =>
        timelineEl.insertAdjacentHTML("beforeend", buildCertCard(row, i))
      );
      console.info(`[CMS] ✅ ${certs.length} certificate(s) loaded.`);
    }

    // ── Projects — newest first ───────────────────────────────────
    if (projectGridEl && projects.length) {
      [...projects].reverse().forEach(row =>
        projectGridEl.insertAdjacentHTML("beforeend", buildProjectCard(row))
      );
      console.info(`[CMS] ✅ ${projects.length} project(s) loaded.`);
    }

    // ── Skills — original submission order (oldest first) ─────────
    if (skillsGridEl && skills.length) {
      skills.forEach(row =>
        skillsGridEl.insertAdjacentHTML("beforeend", buildSkillCard(row))
      );
      console.info(`[CMS] ✅ ${skills.length} skill(s) loaded.`);
    }

  } catch (err) {
    // Clean up loaders even on failure
    certLoader.remove?.();
    projLoader.remove?.();
    skillLoader.remove?.();
    console.error("[CMS] Failed to load content:", err.message);
  }
}


/* ── Run when DOM is ready ── */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadContent);
} else {
  loadContent();
}