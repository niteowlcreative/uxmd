import { NextResponse } from "next/server";

/* ─── Figma URL parsing ────────────────────────────────── */

/**
 * Accepts:
 *   https://www.figma.com/design/<key>/...
 *   https://www.figma.com/file/<key>/...
 * Returns the file key string, or null if unparseable.
 */
function parseFigmaKey(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("figma.com")) return null;
    const m = u.pathname.match(/\/(?:design|file)\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/* ─── colour helpers (same as extract-site) ───────────────── */

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.min(255, n * 255))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function colorLuminance(r: number, g: number, b: number): number {
  return (r * 255 + g * 255 + b * 255) / 3;
}

function isNeutralRGB(r: number, g: number, b: number, a: number): boolean {
  if (a < 0.1) return true; // transparent
  const lum = colorLuminance(r, g, b);
  return lum > 225 || lum < 30;
}

/* ─── Figma document traversal ─────────────────────────── */

interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectNodeColors(node: any, out: FigmaColor[]): void {
  if (!node || typeof node !== "object") return;

  // fills
  if (Array.isArray(node.fills)) {
    for (const fill of node.fills) {
      if (fill.type === "SOLID" && fill.color) {
        out.push({ ...fill.color, a: fill.opacity ?? fill.color.a ?? 1 });
      }
    }
  }
  // strokes
  if (Array.isArray(node.strokes)) {
    for (const stroke of node.strokes) {
      if (stroke.type === "SOLID" && stroke.color) {
        out.push({ ...stroke.color, a: stroke.opacity ?? stroke.color.a ?? 1 });
      }
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) collectNodeColors(child, out);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectFontSizes(node: any, out: number[]): void {
  if (!node || typeof node !== "object") return;
  if (node.type === "TEXT" && node.style?.fontSize) {
    out.push(node.style.fontSize as number);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectFontSizes(child, out);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectFontFamilies(node: any, out: Set<string>): void {
  if (!node || typeof node !== "object") return;
  if (node.type === "TEXT" && node.style?.fontFamily) {
    out.add(node.style.fontFamily as string);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectFontFamilies(child, out);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectCornerRadius(node: any, out: number[]): void {
  if (!node || typeof node !== "object") return;
  if (typeof node.cornerRadius === "number" && node.cornerRadius > 0) {
    out.push(node.cornerRadius);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectCornerRadius(child, out);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectSpacing(node: any, paddings: number[]): void {
  if (!node || typeof node !== "object") return;
  for (const key of [
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "itemSpacing",
  ] as const) {
    const v = node[key];
    if (typeof v === "number" && v > 0 && v < 300) paddings.push(v);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectSpacing(child, paddings);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectComponentNames(node: any, out: string[]): void {
  if (!node || typeof node !== "object") return;
  if (
    (node.type === "COMPONENT" || node.type === "COMPONENT_SET") &&
    typeof node.name === "string"
  ) {
    const name = node.name.trim();
    if (name && !out.includes(name)) out.push(name);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectComponentNames(child, out);
  }
}

/* ─── value helpers ────────────────────────────────────── */

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
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

  const fileKey = parseFigmaKey(rawUrl);
  if (!fileKey) return NextResponse.json({ error: "invalid_url" }, { status: 400 });

  const token = process.env.FIGMA_API_TOKEN;
  if (!token) return NextResponse.json({ error: "no_token" }, { status: 500 });

  /* Fetch Figma file */
  let figmaData: Record<string, unknown>;
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15000);
    const res = await fetch(
      `https://api.figma.com/v1/files/${fileKey}?depth=5`,
      {
        signal: ac.signal,
        headers: { "X-Figma-Token": token },
      }
    );
    clearTimeout(t);
    if (!res.ok) {
      const status = res.status;
      if (status === 403 || status === 404)
        return NextResponse.json({ error: "fetch_failed" }, { status: 422 });
      throw new Error(`Figma API ${status}`);
    }
    figmaData = await res.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 422 });
  }

  const doc = (figmaData.document ?? {}) as Record<string, unknown>;
  const fileName = (figmaData.name as string) ?? "";

  /* ── colours ──────────────────────────────────────────── */
  const rawColors: FigmaColor[] = [];
  collectNodeColors(doc, rawColors);

  // Frequency map by hex
  const colorCount: Record<string, number> = {};
  for (const c of rawColors) {
    if (isNeutralRGB(c.r, c.g, c.b, c.a)) continue;
    const hex = rgbToHex(c.r, c.g, c.b);
    colorCount[hex] = (colorCount[hex] ?? 0) + 1;
  }
  const topColors = Object.entries(colorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([hex]) => hex);

  /* ── background ───────────────────────────────────────── */
  // Check background color of the first page/frame
  const allColors: FigmaColor[] = [];
  collectNodeColors(doc, allColors);
  // Most frequent near-neutral = likely background
  const neutralCount: Record<string, { c: FigmaColor; n: number }> = {};
  for (const c of allColors) {
    if (!isNeutralRGB(c.r, c.g, c.b, c.a)) continue;
    const hex = rgbToHex(c.r, c.g, c.b);
    if (!neutralCount[hex]) neutralCount[hex] = { c, n: 0 };
    neutralCount[hex].n++;
  }
  const topNeutral = Object.values(neutralCount).sort((a, b) => b.n - a.n)[0];
  let background = "Light";
  if (topNeutral) {
    const lum = colorLuminance(topNeutral.c.r, topNeutral.c.g, topNeutral.c.b);
    background = lum > 128 ? "Light" : "Dark";
  }

  /* ── fonts ────────────────────────────────────────────── */
  const fontFamilySet = new Set<string>();
  collectFontFamilies(doc, fontFamilySet);
  const fonts = [...fontFamilySet].slice(0, 5);

  /* ── font sizes ───────────────────────────────────────── */
  const fontSizes: number[] = [];
  collectFontSizes(doc, fontSizes);

  /* ── spacing ──────────────────────────────────────────── */
  const paddingValues: number[] = [];
  collectSpacing(doc, paddingValues);
  let spacing = "Balanced";
  if (paddingValues.length) {
    const a = avg(paddingValues);
    spacing = a < 12 ? "Tight and dense" : a > 24 ? "Open and airy" : "Balanced";
  }

  /* ── border radius ────────────────────────────────────── */
  const radiusValues: number[] = [];
  collectCornerRadius(doc, radiusValues);
  let borderRadius: string | undefined;
  if (radiusValues.length) {
    const a = avg(radiusValues);
    borderRadius = a <= 2 ? "Sharp" : a <= 6 ? "Subtle" : a <= 12 ? "Soft" : "Pill";
  }

  /* ── component names ──────────────────────────────────── */
  const componentNames: string[] = [];
  collectComponentNames(doc, componentNames);
  // Also pull from the top-level components map
  const componentMap = (figmaData.components ?? {}) as Record<
    string,
    { name: string }
  >;
  for (const comp of Object.values(componentMap)) {
    if (comp.name && !componentNames.includes(comp.name.trim())) {
      componentNames.push(comp.name.trim());
    }
  }
  const topComponents = componentNames.slice(0, 40);

  /* ── typography description ───────────────────────────── */
  let typography: string | undefined;
  if (fonts[0]) {
    const lower = fonts[0].toLowerCase();
    const style =
      /serif|garamond|times|georgia|playfair|merriweather/i.test(lower)
        ? "editorial serif"
        : /mono|code|courier/i.test(lower)
        ? "monospace"
        : "clean sans-serif";
    typography = `${fonts[0]} — ${style}`;
  }

  /* ── aesthetic reference ──────────────────────────────── */
  const tone = background === "Dark" ? "Dark-mode" : "Light";
  const accentDesc = topColors[0]
    ? `${topColors[0]} as the primary accent`
    : "a restrained accent palette";
  const fontDesc = fonts[0] ? `${fonts[0]} typography` : "system typography";
  const spacingDesc =
    spacing === "Tight and dense"
      ? "compact spacing"
      : spacing === "Open and airy"
      ? "generous whitespace"
      : "balanced spacing";
  const aestheticReference = `${tone} design with ${accentDesc}. ${fontDesc} with ${spacingDesc}.`;

  /* ── assemble fields ──────────────────────────────────── */
  const fields: Record<string, string | boolean | null> = {
    background,
    aestheticReference,
  };
  if (topColors[0]) fields.primaryColour = topColors[0];
  if (topColors[1]) fields.secondaryColour = topColors[1];
  if (typography) fields.typography = typography;
  if (spacing) fields.spacing = spacing;
  if (borderRadius) fields.borderRadius = borderRadius;
  if (topComponents.length) fields.figmaComponents = topComponents.join(",");

  return NextResponse.json({
    fields,
    domain: fileName || `figma.com/file/${fileKey}`,
  });
}
