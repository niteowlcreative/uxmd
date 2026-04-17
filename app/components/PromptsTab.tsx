"use client";

import { useState } from "react";

interface Prompt {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
}

const PROMPTS: Prompt[] = [
  {
    id: "bootstrap-ui",
    category: "Start a project",
    title: "Bootstrap a full UI from DESIGN.md",
    description: "Scaffold a complete UI using your design context document as the source of truth.",
    prompt: `I've pasted my DESIGN.md above. Using it as the authoritative source, scaffold the full UI for this project. Apply the colour palette, typography, spacing, and component conventions exactly as specified. Do not introduce styles, fonts, or patterns that aren't in the document. Flag any gaps you encounter rather than filling them with defaults.`,
  },
  {
    id: "component-library",
    category: "Start a project",
    title: "Set up a component library",
    description: "Create a base set of reusable components derived from DESIGN.md.",
    prompt: `Based on the DESIGN.md I've provided, create a base component library. Build: Button (all variants), Input, Label, Badge, Card, and a navigation shell. Each component should use only the CSS variables, spacing values, and typography defined in the document. Export each as a named component. Do not add props or variants beyond what the spec describes.`,
  },
  {
    id: "scaffold-page",
    category: "Start a project",
    title: "Scaffold a page layout",
    description: "Generate a page layout that follows the grid and spacing rules in DESIGN.md.",
    prompt: `Using my DESIGN.md as context, scaffold a [page name] page layout. Apply the max-content width, page padding, and z-layer rules from the document. Use the surface and background colours for depth. Ensure the layout works on both desktop and mobile per the device targets specified.`,
  },
  {
    id: "generic-component",
    category: "Build a component",
    title: "Generic component request",
    description: "Template for requesting any new component that aligns with the design system.",
    prompt: `Build a [component name] component. Refer to the DESIGN.md context I've provided. Use only the colours, typography, spacing, border radius, and interaction patterns defined there. The component should support these states: [list states]. Do not introduce patterns, colours, or effects not present in the design document.`,
  },
  {
    id: "navigation-component",
    category: "Build a component",
    title: "Navigation component",
    description: "Build the primary navigation using the tab or nav patterns from DESIGN.md.",
    prompt: `Build the primary navigation component for this project based on my DESIGN.md. Apply the navigation pattern specified (top nav / sidebar / bottom nav). Use the correct typography, active/inactive states, and colour tokens. Ensure keyboard navigation works and all items have visible focus states.`,
  },
  {
    id: "form-validation",
    category: "Build a component",
    title: "Form with validation",
    description: "Create a validated form using the input and label styles from DESIGN.md.",
    prompt: `Build a [form name] form using the input, label, and error styles defined in my DESIGN.md. Apply inline validation — errors should surface as the spec describes (inline / toast / modal). Use the correct focus ring, placeholder colour, and label typography. Required fields should be clearly indicated without relying on colour alone.`,
  },
  {
    id: "data-table",
    category: "Build a component",
    title: "Data table",
    description: "Generate a data table that matches the visual system in DESIGN.md.",
    prompt: `Build a data table component using the surface, border, and typography tokens from my DESIGN.md. Rows use surface-2 on hover. Header row uses the stronger border. Text follows the type scale. Ensure sufficient row height for the minimum touch target if this will be used on mobile.`,
  },
  {
    id: "card-grid",
    category: "Build a component",
    title: "Card grid",
    description: "Create a responsive card grid using the card spec from DESIGN.md.",
    prompt: `Create a responsive card grid using the Card component spec from my DESIGN.md. Apply the correct background, border, border-radius, and padding. No box-shadows — use background contrast for elevation. Cards should reflow to a single column on mobile. Include a hover state per the interaction principles in the document.`,
  },
  {
    id: "responsive-fix",
    category: "Fix and iterate",
    title: "Responsive layout fix",
    description: "Debug and fix a layout that isn't behaving correctly on mobile.",
    prompt: `This layout isn't working correctly on mobile. Review it against my DESIGN.md — specifically the device targets, page padding, and stacking behaviour specified. Fix the responsive issues. Do not change the desktop layout. Explain each change and which part of the spec it corresponds to.`,
  },
  {
    id: "spacing-density",
    category: "Fix and iterate",
    title: "Spacing and density adjustment",
    description: "Correct spacing that doesn't match the 8px grid or the density spec.",
    prompt: `Audit the spacing in [component / page]. My DESIGN.md specifies an 8px base unit — all spacing should be multiples of 8. Identify and fix any values that deviate. Also check the spacing philosophy (tight / balanced / open) and adjust density accordingly. List every change you make.`,
  },
  {
    id: "accessibility-pass",
    category: "Fix and iterate",
    title: "Accessibility pass",
    description: "Review and fix WCAG compliance issues against the accessibility target in DESIGN.md.",
    prompt: `Conduct an accessibility pass on [component / page]. My DESIGN.md specifies [WCAG AA / WCAG AAA / AODA] compliance. Check: colour contrast ratios, focus states (pink ring as specified), keyboard navigation, touch target sizes (44×44px minimum), and that colour is not the only way information is communicated. Fix all issues you find and explain each one.`,
  },
  {
    id: "dark-mode",
    category: "Fix and iterate",
    title: "Dark mode implementation",
    description: "Ensure the UI uses the correct dark canvas and surface colours from DESIGN.md.",
    prompt: `This interface should be dark-only as specified in my DESIGN.md. Audit the component for any hardcoded light-mode values, incorrect background colours, or surfaces that don't match the palette. Replace everything with the correct CSS variables. There is no light mode — do not add a toggle or media query fallback.`,
  },
  {
    id: "critique-output",
    category: "Review and critique",
    title: "Critique your output against DESIGN.md",
    description: "Ask Claude to self-review its own generated code against the design document.",
    prompt: `Review the component you just built against my DESIGN.md. For each design token, typography rule, spacing value, and interaction pattern in the document — check whether your output matches. List every deviation, no matter how small. Then fix them. Be specific: quote both the spec and what you generated.`,
  },
  {
    id: "heuristic-eval",
    category: "Review and critique",
    title: "Heuristic evaluation",
    description: "Run a heuristic review of the UI against standard usability principles.",
    prompt: `Run a heuristic evaluation of [component / page] using Nielsen's 10 usability heuristics. Cross-reference findings against the design intent and constraints in my DESIGN.md. Flag violations, borderline cases, and anything that contradicts the stated tone or interaction principles. Prioritise by severity.`,
  },
  {
    id: "consistency-check",
    category: "Review and critique",
    title: "Consistency check across components",
    description: "Identify inconsistencies between components in the same design system.",
    prompt: `Compare [component A] and [component B]. Identify any inconsistencies in: colour token usage, typography, spacing, border radius, hover states, and focus rings. Everything should map back to the same values in my DESIGN.md. List each inconsistency and which component should change to align with the spec.`,
  },
  {
    id: "typography-refinement",
    category: "Micro-adjustments",
    title: "Typography refinement",
    description: "Fine-tune type size, weight, tracking, or line-height to match the spec.",
    prompt: `The typography in [component] doesn't match my DESIGN.md. Check: font families (Bebas Neue for headings, DM Sans for body), sizes from the type scale, weights (300 / 400 / 500 only — never 600 or 700), letter-spacing, line-height, and text-transform. Fix anything that deviates. Show before and after values.`,
  },
  {
    id: "colour-tweak",
    category: "Micro-adjustments",
    title: "Colour application tweak",
    description: "Correct colour usage that doesn't follow the accent rules in DESIGN.md.",
    prompt: `Audit the colour usage in [component]. Per my DESIGN.md: pink (#F72585) is for primary CTAs, active states, and focus rings. Purple (#9B5DE5) is for secondary actions, completed states, and depth accents. They should never both appear on the same interactive element. Muted variants (15% alpha) are for badge backgrounds only. Fix any violations.`,
  },
  {
    id: "motion-transition",
    category: "Micro-adjustments",
    title: "Motion and transition adjustment",
    description: "Align all animations and transitions to the motion spec in DESIGN.md.",
    prompt: `Review all transitions and animations in [component]. Per my DESIGN.md: default transition is 150ms ease, hover states shift opacity or background tint, focus rings appear immediately with no transition, and no scale transforms except on active/press state (scale 0.98, 80ms). Nothing bounces. Fix any violations and remove any transitions not specified.`,
  },
  {
    id: "copy-tone",
    category: "Micro-adjustments",
    title: "Copy and tone pass",
    description: "Rewrite UI copy to match the voice and tone defined in DESIGN.md.",
    prompt: `Rewrite all UI copy in [component / page] to match the tone defined in my DESIGN.md: direct, confident, zero fluff. Action verbs for CTAs. Error messages are specific and helpful — never apologetic. Empty states tell the user what to do. Bebas Neue naturally enforces brief, punchy button copy — keep it short. Show the before and after for each string.`,
  },
];

const CATEGORIES = Array.from(new Set(PROMPTS.map((p) => p.category)));

export default function PromptsTab() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = PROMPTS.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = CATEGORIES.reduce<Record<string, Prompt[]>>((acc, cat) => {
    const matches = filtered.filter((p) => p.category === cat);
    if (matches.length > 0) acc[cat] = matches;
    return acc;
  }, {});

  const handleCopy = async (prompt: Prompt) => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 32px" }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "36px",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: "var(--uxmd-text)",
            marginBottom: "8px",
          }}
        >
          Prompt Library
        </h2>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "15px",
            color: "var(--uxmd-text-muted)",
            marginBottom: "24px",
          }}
        >
          Copy-paste prompts for building with your DESIGN.md. Works with Claude
          Code, Cursor, GitHub Copilot, and GPT/Codex.
        </p>

        {/* Search */}
        <input
          type="search"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "var(--uxmd-surface-2)",
            border: "0.5px solid var(--uxmd-border-strong)",
            borderRadius: "6px",
            padding: "10px 14px",
            color: "var(--uxmd-text)",
            fontFamily: "var(--font-dm-sans)",
            fontSize: "14px",
            width: "100%",
            maxWidth: "480px",
            outline: "none",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 0 0 2px rgba(247,37,133,0.4)")
          }
          onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
        />
      </div>

      {/* Results */}
      {Object.keys(grouped).length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "15px",
            color: "var(--uxmd-text-muted)",
          }}
        >
          No prompts match &ldquo;{search}&rdquo;. Try a different keyword.
        </p>
      ) : (
        Object.entries(grouped).map(([category, prompts]) => (
          <section key={category} style={{ marginBottom: "40px" }}>
            <h3
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "13px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--uxmd-text-dim)",
                marginBottom: "16px",
                paddingBottom: "8px",
                borderBottom: "0.5px solid var(--uxmd-border)",
              }}
            >
              {category}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "16px",
              }}
            >
              {prompts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "var(--uxmd-surface)",
                    border: "0.5px solid var(--uxmd-border)",
                    borderRadius: "10px",
                    padding: "16px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <h4
                      style={{
                        fontFamily: "var(--font-bebas)",
                        fontSize: "18px",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        color: "var(--uxmd-text)",
                        lineHeight: 1.2,
                      }}
                    >
                      {p.title}
                    </h4>
                    <button
                      onClick={() => handleCopy(p)}
                      style={{
                        background:
                          copiedId === p.id
                            ? "var(--uxmd-purple-muted)"
                            : "transparent",
                        color:
                          copiedId === p.id
                            ? "var(--uxmd-purple)"
                            : "var(--uxmd-text-muted)",
                        border: `0.5px solid ${copiedId === p.id ? "var(--uxmd-purple)" : "var(--uxmd-border-strong)"}`,
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontFamily: "var(--font-bebas)",
                        fontSize: "13px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 150ms ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {copiedId === p.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      color: "var(--uxmd-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {p.description}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "11px",
                      color: "var(--uxmd-text-dim)",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Works with Claude Code, Cursor, GitHub Copilot, and
                    GPT/Codex
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
