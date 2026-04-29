import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

/* ─── CSS helpers ──────────────────────────────────────── */

/** Extract inline <style> block content from HTML. */
function extractInlineCSS(html: string): string[] {
  const blocks: string[] = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) blocks.push(m[1]);
  return blocks;
}

/** Return all external stylesheet URLs referenced in the HTML. */
function extractSheetURLs(html: string, base: string): string[] {
  const urls: string[] = [];
  // href before or after rel=
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
      } catch {
        /* ignore unparseable hrefs */
      }
    }
  }
  return urls.slice(0, 5); // cap at 5 sheets
}

/** Fetch an external stylesheet; returns empty string on failure. */
async function fetchSheet(url: string): Promise<string> {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 5000);
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(t);
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

/* ─── Data extraction helpers ──────────────────────────── */

/** True if a CSS colour string is very light, very dark, or a keyword. */
function isNeutral(c: string): boolean {
  const lc = c.toLowerCase().trim();
  if (["white", "black", "transparent", "inherit", "currentcolor", "none"].includes(lc))
    return true;
  const hex = lc.replace("#", "");
  const parse = (h: string) => {
    const full = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  };
  if ((hex.length === 3 || hex.length === 6) && /^[0-9a-f]+$/.test(hex)) {
    const [r, g, b] = parse(hex);
    const lum = (r + g + b) / 3;
    if (lum > 230 || lum < 25) return true;
  }
  return false;
}

interface ExtractedData {
  topColors: string[];
  allColorsFreq: string[];
  fonts: string[];
  fontSizes: string[];
  fontWeights: string[];
  spacingValues: string[];
  radiusValues: string[];
  hasTransitions: boolean;
  hasAnimations: boolean;
  navPatterns: string[];
  buttonPatterns: string[];
  inputPatterns: string[];
  backgroundColors: string[];
  googleFonts: string[];
}

function parseCSSData(cssText: string, html: string): ExtractedData {
  // ── colours ────────────────────────────────────────────
  const colorRe = /#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)/g;
  const colorCount: Record<string, number> = {};
  for (const m of cssText.matchAll(colorRe)) {
    const c = m[0].toLowerCase().trim();
    colorCount[c] = (colorCount[c] ?? 0) + 1;
  }
  const sortedColors = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1]);
  const topColors = sortedColors
    .filter(([c]) => !isNeutral(c))
    .slice(0, 15)
    .map(([c]) => c);
  const allColorsFreq = sortedColors.slice(0, 30).map(([c, n]) => `${c}(×${n})`);

  // ── background colours from body/html ──────────────────
  const bgRe = /(?:body|html)[^{]*\{[^}]*background(?:-color)?:\s*([^;}\n]+)/gi;
  const backgroundColors: string[] = [];
  for (const m of cssText.matchAll(bgRe)) backgroundColors.push(m[1].trim());

  // ── fonts ──────────────────────────────────────────────
  const fontFamilyRe = /font-family:\s*([^;}{]+)/gi;
  const fontSet = new Set<string>();
  for (const m of cssText.matchAll(fontFamilyRe)) {
    const raw = m[1].split(",").map((f) => f.trim().replace(/['"]/g, "").trim());
    for (const f of raw) {
      const lower = f.toLowerCase();
      if (
        f &&
        !["inherit", "initial", "unset", "revert", "sans-serif", "serif", "monospace",
          "system-ui", "-apple-system", "blinkmacsystemfont", "segoe ui", "roboto",
          "helvetica", "arial", "georgia", "times"].includes(lower)
      ) fontSet.add(f);
    }
  }

  // Google Fonts from @import or href
  const gfRe = /fonts\.googleapis\.com\/css[^"'\s)]*family=([^&"'\s):]+)/gi;
  const googleFonts: string[] = [];
  for (const m of cssText.matchAll(gfRe)) {
    const names = m[1].split("|").map((f) => f.split(":")[0].replace(/\+/g, " ").trim());
    for (const n of names) if (n) { fontSet.add(n); googleFonts.push(n); }
  }
  // also check link hrefs in html
  for (const m of html.matchAll(gfRe)) {
    const names = m[1].split("|").map((f) => f.split(":")[0].replace(/\+/g, " ").trim());
    for (const n of names) if (n) { fontSet.add(n); googleFonts.push(n); }
  }

  // ── font sizes ─────────────────────────────────────────
  const fsRe = /font-size:\s*([^;}{]+)/gi;
  const fsSet = new Set<string>();
  for (const m of cssText.matchAll(fsRe)) fsSet.add(m[1].trim());

  // ── font weights ───────────────────────────────────────
  const fwRe = /font-weight:\s*([^;}{]+)/gi;
  const fwSet = new Set<string>();
  for (const m of cssText.matchAll(fwRe)) fwSet.add(m[1].trim());

  // ── spacing ────────────────────────────────────────────
  const spacingRe = /(?:padding|margin):\s*([^;}{]+)/gi;
  const spacingSet = new Set<string>();
  for (const m of cssText.matchAll(spacingRe)) spacingSet.add(m[1].trim());

  // ── border-radius ──────────────────────────────────────
  const radiusRe = /border-radius:\s*([^;}{]+)/gi;
  const radiusSet = new Set<string>();
  for (const m of cssText.matchAll(radiusRe)) radiusSet.add(m[1].trim());

  // ── transitions / animations ───────────────────────────
  const hasTransitions = /transition\s*:/i.test(cssText);
  const hasAnimations = /@keyframes|animation\s*:/i.test(cssText);

  // ── component patterns (from HTML structure) ───────────
  const navPatterns: string[] = [];
  if (/<nav/i.test(html)) navPatterns.push("has-nav-element");
  if (/role=["']navigation["']/i.test(html)) navPatterns.push("has-role-navigation");
  if (/sidebar|side-nav|sidenav/i.test(html)) navPatterns.push("possible-sidebar");
  if (/bottom-nav|bottom-bar|tab-bar/i.test(html)) navPatterns.push("possible-bottom-nav");

  const buttonPatterns: string[] = [];
  if (/class=["'][^"']*btn[^"']*["']/i.test(html)) buttonPatterns.push("btn-classes");
  if (/<button/i.test(html)) buttonPatterns.push("button-elements");
  if (/btn-outline|button--secondary|ghost/i.test(html)) buttonPatterns.push("multiple-variants");

  const inputPatterns: string[] = [];
  const borderOnInputs = /input[^{]*\{[^}]*border(?!-radius)/i.test(cssText);
  if (borderOnInputs) inputPatterns.push("bordered-inputs");
  if (/input\s*\{[^}]*background/i.test(cssText)) inputPatterns.push("filled-inputs");
  if (/underline|border-bottom/i.test(cssText) && /<input/i.test(html)) inputPatterns.push("possible-underline");

  return {
    topColors,
    allColorsFreq,
    fonts: [...fontSet].slice(0, 10),
    fontSizes: [...fsSet].slice(0, 20),
    fontWeights: [...fwSet].slice(0, 10),
    spacingValues: [...spacingSet].slice(0, 20),
    radiusValues: [...radiusSet].slice(0, 20),
    hasTransitions,
    hasAnimations,
    navPatterns,
    buttonPatterns,
    inputPatterns,
    backgroundColors: backgroundColors.slice(0, 5),
    googleFonts,
  };
}

/* ─── Claude interpretation ────────────────────────────── */

const SYSTEM_PROMPT = `You are a senior UX designer analyzing a website's extracted CSS and HTML data. Your job is to identify the design system from the noise.

From the raw data provided, determine:

1. primary_color: The single most important brand colour. Not white, not black, not grey — the colour that defines the brand.
2. secondary_color: The secondary accent or supporting colour.
3. background: "light" or "dark" based on the body background.
4. typography: The primary font family used for body text, and the heading font if different. Include a style description like "clean sans-serif" or "editorial serif".
5. spacing: "tight" or "balanced" or "airy" based on the dominant padding/margin values.
6. border_radius: "sharp" (0-2px) or "subtle" (3-6px) or "soft" (7-12px) or "pill" (>12px) based on button and card radius.
7. button_style: Describe the primary button appearance — filled, outlined, pill, etc.
8. nav_pattern: "top" or "sidebar" or "bottom" or "none" based on the nav structure detected.
9. form_style: "outlined" or "filled" or "underline" or "unknown" based on input element styles.
10. icon_style: "outlined" or "filled" or "custom" or "none"
11. aesthetic_summary: A 1-2 sentence description of the overall aesthetic feel of the site. E.g. "Clean and corporate with generous whitespace and a restrained colour palette" or "Bold and playful with bright accents and rounded elements."
12. motion_preference: "none" or "subtle" or "expressive" — infer from the presence of CSS transitions/animations.

Respond ONLY with a JSON object. No preamble, no markdown backticks, no explanation. Just the JSON.`;

interface ClaudeResult {
  primary_color?: string;
  secondary_color?: string;
  background?: string;
  typography?: string;
  spacing?: string;
  border_radius?: string;
  button_style?: string;
  nav_pattern?: string;
  form_style?: string;
  icon_style?: string;
  aesthetic_summary?: string;
  motion_preference?: string;
}

async function interpretWithClaude(data: ExtractedData): Promise<ClaudeResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = JSON.stringify(data, null, 2);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";

  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned) as ClaudeResult;
}

/* ─── Field mapping ────────────────────────────────────── */

type FieldMap = Record<string, string | boolean | null>;

function mapToFields(result: ClaudeResult): FieldMap {
  const fields: FieldMap = {};

  if (result.primary_color) fields.primaryColour = result.primary_color;
  if (result.secondary_color) fields.secondaryColour = result.secondary_color;

  if (result.background) {
    const bg = result.background.toLowerCase();
    fields.background = bg === "dark" ? "Dark" : bg === "light" ? "Light" : "Light";
  }

  if (result.typography) fields.typography = result.typography;

  if (result.spacing) {
    const s = result.spacing.toLowerCase();
    fields.spacing =
      s === "tight" ? "Tight and dense" : s === "airy" ? "Open and airy" : "Balanced";
  }

  if (result.border_radius) {
    const r = result.border_radius.toLowerCase();
    fields.borderRadius =
      r === "sharp" ? "Sharp" : r === "subtle" ? "Subtle" : r === "soft" ? "Soft" : r === "pill" ? "Pill" : "";
  }

  if (result.button_style) fields.buttonHierarchy = result.button_style;

  if (result.nav_pattern) {
    const n = result.nav_pattern.toLowerCase();
    fields.navigationPattern =
      n === "top" ? "Top nav" : n === "sidebar" ? "Sidebar" : n === "bottom" ? "Bottom nav" : "Not decided yet";
  }

  if (result.form_style) {
    const f = result.form_style.toLowerCase();
    fields.formFields =
      f === "outlined" ? "Outlined" : f === "filled" ? "Filled" : f === "underline" ? "Underline" : "";
  }

  if (result.icon_style) {
    const i = result.icon_style.toLowerCase();
    fields.iconStyle =
      i === "outlined" ? "Outlined" : i === "filled" ? "Filled" : i === "custom" ? "Custom" : i === "none" ? "No icons" : "";
  }

  if (result.aesthetic_summary) fields.aestheticReference = result.aesthetic_summary;

  if (result.motion_preference) {
    const m = result.motion_preference.toLowerCase();
    fields.motion = m === "none" ? "None" : m === "expressive" ? "Expressive" : "Subtle";
  }

  return fields;
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

  // Ensure protocol
  const urlWithProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  // ── Step A: Fetch and parse ──────────────────────────
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

  // Collect CSS text
  const inlineCSS = extractInlineCSS(html);
  const sheetURLs = extractSheetURLs(html, parsedUrl.toString());
  const externalSheets = await Promise.all(sheetURLs.map(fetchSheet));
  const allCSS = [...inlineCSS, ...externalSheets].join("\n");

  const extracted = parseCSSData(allCSS, html);

  // ── Step B: Claude interpretation ────────────────────
  let fields: FieldMap;
  try {
    const result = await interpretWithClaude(extracted);
    fields = mapToFields(result);
  } catch {
    return NextResponse.json({ error: "claude_failed" }, { status: 500 });
  }

  return NextResponse.json({ fields, domain: parsedUrl.hostname });
}
