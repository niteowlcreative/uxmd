import { NextResponse } from "next/server";

/* ─── CSS collection ───────────────────────────────────── */

function extractInlineCSS(html: string): string[] {
  const blocks: string[] = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) blocks.push(m[1]);
  return blocks;
}

function extractSheetURLs(html: string, base: string): string[] {
  const urls: string[] = [];
  const patterns = [
    /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html))) {
      try {
        const resolved = new URL(m[1], base).toString();
        if (!urls.includes(resolved)) urls.push(resolved);
      } catch { /* skip unparseable hrefs */ }
    }
  }
  return urls.slice(0, 5);
}

async function fetchSheet(url: string): Promise<string> {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 5000);
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(t);
    return res.ok ? await res.text() : "";
  } catch { return ""; }
}

/* ─── colour helpers ───────────────────────────────────── */

/** Average RGB luminance 0–255, or null if not parseable. */
function colorLuminance(c: string): number | null {
  const lc = c.toLowerCase().trim();
  if (lc === "white") return 255;
  if (lc === "black") return 0;

  const hex = lc.replace("#", "");
  if (/^[0-9a-f]{3,8}$/.test(hex)) {
    const full =
      hex.length === 3
        ? hex.split("").map((x) => x + x).join("")
        : hex.slice(0, 6);
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return (r + g + b) / 3;
  }
  const rgb = lc.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return (Number(rgb[1]) + Number(rgb[2]) + Number(rgb[3])) / 3;
  return null;
}

/** True when a colour should be excluded from "brand" palette. */
function isNeutral(c: string): boolean {
  const lc = c.toLowerCase().trim();
  if (
    ["white", "black", "transparent", "inherit", "currentcolor", "none"].includes(lc)
  )
    return true;
  const lum = colorLuminance(c);
  if (lum === null) return false;
  return lum > 225 || lum < 30;
}

/* ─── numeric value extraction ─────────────────────────── */

/** Pull all numeric px / rem values from a CSS value string. Returns px equivalents. */
function toPxValues(vals: string[]): number[] {
  const out: number[] = [];
  for (const v of vals) {
    for (const m of v.matchAll(/(\d+(?:\.\d+)?)px/g)) {
      const n = parseFloat(m[1]);
      if (n > 0 && n < 300) out.push(n);
    }
    for (const m of v.matchAll(/(\d+(?:\.\d+)?)rem/g)) {
      const n = parseFloat(m[1]) * 16;
      if (n > 0 && n < 300) out.push(n);
    }
  }
  return out;
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

/* ─── main parser ──────────────────────────────────────── */

interface ParsedSite {
  topColors: string[];
  backgroundColors: string[];
  fonts: string[];
  googleFonts: string[];
  spacingValues: string[];
  radiusValues: string[];
  hasTransitions: boolean;
  hasAnimations: boolean;
  navPatterns: string[];
  buttonPatterns: string[];
  inputPatterns: string[];
}

function parseSite(cssText: string, html: string): ParsedSite {
  /* colours */
  const colorCount: Record<string, number> = {};
  for (const m of cssText.matchAll(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g)) {
    const c = m[0].toLowerCase().trim();
    colorCount[c] = (colorCount[c] ?? 0) + 1;
  }
  const sortedColors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]);
  const topColors = sortedColors.filter(([c]) => !isNeutral(c)).slice(0, 15).map(([c]) => c);

  /* body/html background */
  const bgColors: string[] = [];
  for (const m of cssText.matchAll(
    /(?:body|html)[^{]*\{[^}]*background(?:-color)?:\s*([^;}\n]+)/gi
  ))
    bgColors.push(m[1].trim());

  /* fonts */
  const fontSet = new Set<string>();
  for (const m of cssText.matchAll(/font-family:\s*([^;}{]+)/gi)) {
    const families = m[1].split(",").map((f) => f.trim().replace(/['"]/g, "").trim());
    for (const f of families) {
      const lower = f.toLowerCase();
      if (
        f &&
        ![
          "inherit", "initial", "unset", "revert", "sans-serif", "serif",
          "monospace", "system-ui", "-apple-system", "blinkmacsystemfont",
          "segoe ui", "roboto", "helvetica", "arial", "georgia", "times",
        ].includes(lower)
      )
        fontSet.add(f);
    }
  }
  const googleFonts: string[] = [];
  const gfSource = cssText + html;
  for (const m of gfSource.matchAll(
    /fonts\.googleapis\.com\/css[^"'\s)]*family=([^&"'\s):]+)/gi
  )) {
    const names = m[1].split("|").map((f) =>
      f.split(":")[0].replace(/\+/g, " ").trim()
    );
    for (const n of names) {
      if (n) { fontSet.add(n); googleFonts.push(n); }
    }
  }

  /* spacing */
  const spacingSet = new Set<string>();
  for (const m of cssText.matchAll(/(?:padding|margin):\s*([^;}{]+)/gi))
    spacingSet.add(m[1].trim());

  /* border radius */
  const radiusSet = new Set<string>();
  for (const m of cssText.matchAll(/border-radius:\s*([^;}{]+)/gi))
    radiusSet.add(m[1].trim());

  /* motion */
  const hasTransitions = /transition\s*:/i.test(cssText);
  const hasAnimations = /@keyframes|animation\s*:/i.test(cssText);

  /* nav / button / input */
  const navPatterns: string[] = [];
  if (/<nav/i.test(html)) navPatterns.push("nav-element");
  if (/role=["']navigation["']/i.test(html)) navPatterns.push("role-navigation");
  if (/sidebar|side-nav|sidenav/i.test(html + cssText)) navPatterns.push("sidebar");
  if (/bottom-nav|bottom-bar|tab-bar/i.test(html + cssText)) navPatterns.push("bottom-nav");

  const buttonPatterns: string[] = [];
  if (/class=["'][^"']*btn[^"']*["']/i.test(html)) buttonPatterns.push("btn-classes");
  if (/btn-outline|button--secondary|ghost|outlined/i.test(html + cssText))
    buttonPatterns.push("multiple-variants");

  const inputPatterns: string[] = [];
  if (/input[^{]*\{[^}]*border(?!-radius)/i.test(cssText))
    inputPatterns.push("bordered-inputs");
  if (/input[^{]*\{[^}]*background/i.test(cssText))
    inputPatterns.push("filled-inputs");
  if (/underline|border-bottom/i.test(cssText) && /<input/i.test(html))
    inputPatterns.push("underline-possible");

  return {
    topColors,
    backgroundColors: bgColors.slice(0, 5),
    fonts: [...fontSet].slice(0, 10),
    googleFonts,
    spacingValues: [...spacingSet].slice(0, 30),
    radiusValues: [...radiusSet].slice(0, 20),
    hasTransitions,
    hasAnimations,
    navPatterns,
    buttonPatterns,
    inputPatterns,
  };
}

/* ─── deterministic mapping ────────────────────────────── */

function mapFields(site: ParsedSite): Record<string, string | boolean | null> {
  const out: Record<string, string | boolean | null> = {};

  /* primary / secondary colour */
  if (site.topColors[0]) out.primaryColour = site.topColors[0];
  if (site.topColors[1]) out.secondaryColour = site.topColors[1];

  /* light vs dark */
  let bgDetermined = false;
  for (const c of site.backgroundColors) {
    const lum = colorLuminance(c);
    if (lum !== null) {
      out.background = lum > 128 ? "Light" : "Dark";
      bgDetermined = true;
      break;
    }
  }
  if (!bgDetermined) out.background = "Light"; // safe default

  /* typography — prefer Google Fonts, else first detected font */
  const fontCandidate = site.googleFonts[0] ?? site.fonts[0];
  if (fontCandidate) {
    const lower = fontCandidate.toLowerCase();
    const style =
      /serif|garamond|times|georgia|playfair|merriweather/i.test(lower)
        ? "editorial serif"
        : /mono|code|courier/i.test(lower)
        ? "monospace"
        : "clean sans-serif";
    out.typography = `${fontCandidate} — ${style}`;
  }

  /* spacing */
  const pxSpacing = toPxValues(site.spacingValues);
  if (pxSpacing.length) {
    const a = avg(pxSpacing);
    out.spacing = a < 12 ? "Tight and dense" : a > 24 ? "Open and airy" : "Balanced";
  }

  /* border radius */
  const radiusParts = site.radiusValues;
  if (radiusParts.some((v) => /50%|100%|9{3,}px|50px/i.test(v))) {
    out.borderRadius = "Pill";
  } else {
    const pxRadius = toPxValues(radiusParts);
    if (pxRadius.length) {
      const a = avg(pxRadius);
      out.borderRadius =
        a <= 2 ? "Sharp" : a <= 6 ? "Subtle" : a <= 12 ? "Soft" : "Pill";
    }
  }

  /* navigation */
  if (site.navPatterns.includes("sidebar")) {
    out.navigationPattern = "Sidebar";
  } else if (site.navPatterns.includes("bottom-nav")) {
    out.navigationPattern = "Bottom nav";
  } else if (
    site.navPatterns.includes("nav-element") ||
    site.navPatterns.includes("role-navigation")
  ) {
    out.navigationPattern = "Top nav";
  }

  /* form style */
  if (site.inputPatterns.includes("bordered-inputs")) {
    out.formFields = "Outlined";
  } else if (site.inputPatterns.includes("filled-inputs")) {
    out.formFields = "Filled";
  } else if (site.inputPatterns.includes("underline-possible")) {
    out.formFields = "Underline";
  }

  /* motion */
  out.motion = site.hasAnimations
    ? "Expressive"
    : site.hasTransitions
    ? "Subtle"
    : "None";

  /* aesthetic reference — build a short description from what we know */
  const tone = out.background === "Dark" ? "Dark-mode" : "Light";
  const accentDesc =
    out.primaryColour
      ? `${out.primaryColour} as the primary accent`
      : "a restrained accent palette";
  const fontDesc = fontCandidate ? `${fontCandidate} typography` : "system typography";
  const spacingDesc =
    out.spacing === "Tight and dense"
      ? "compact spacing"
      : out.spacing === "Open and airy"
      ? "generous whitespace"
      : "balanced spacing";
  out.aestheticReference =
    `${tone} site with ${accentDesc}. ${fontDesc} with ${spacingDesc}.`;

  return out;
}

/* ─── Route handler ────────────────────────────────────── */

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const rawUrl = (body.url ?? "").trim();
  if (!rawUrl) return NextResponse.json({ error: "missing_url" }, { status: 400 });

  const urlWithProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  /* fetch HTML */
  let html: string;
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 10000);
    const res = await fetch(parsedUrl.toString(), {
      signal: ac.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; UXMD-Analyzer/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 422 });
  }

  /* collect CSS */
  const inlineCSS = extractInlineCSS(html);
  const sheetURLs = extractSheetURLs(html, parsedUrl.toString());
  const externalSheets = await Promise.all(sheetURLs.map(fetchSheet));
  const allCSS = [...inlineCSS, ...externalSheets].join("\n");

  /* parse + map */
  const site = parseSite(allCSS, html);
  const fields = mapFields(site);

  return NextResponse.json({ fields, domain: parsedUrl.hostname });
}
