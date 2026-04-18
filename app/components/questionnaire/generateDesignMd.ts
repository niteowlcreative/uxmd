import type { FormData } from "./types";

function field(value: string | boolean | null, label: string, prose: string): string {
  if (value === null || value === "" || value === undefined) {
    return `<!-- ${label}: not specified — use your judgment -->`;
  }
  return prose;
}

export function generateDesignMd(data: FormData): string {
  const date = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
  const lines: string[] = [];

  lines.push("# DESIGN.md");
  lines.push(`**Project:** ${data.projectName || "Untitled"}`);
  lines.push(`**Generated:** ${date}`);
  lines.push("**Tool:** UXMD by Niteowl Creative — uxmd.io");
  lines.push("");
  lines.push(
    "> Paste this file into your Claude Code, Cursor, or Codex session"
  );
  lines.push("> as context before building. Update it as your project evolves.");
  lines.push("");

  // --- Project overview ---
  lines.push("---");
  lines.push("");
  lines.push("## Project overview");
  lines.push("");
  lines.push(
    field(data.whatItDoes, "What it does", data.whatItDoes)
  );
  lines.push(
    field(data.whoIsItFor, "Who it's for", `Built for: ${data.whoIsItFor}`)
  );
  lines.push(
    field(
      data.howItFeels,
      "Intended feeling",
      `This product should make users feel: ${data.howItFeels}`
    )
  );
  lines.push("");

  // --- Visual language ---
  lines.push("---");
  lines.push("");
  lines.push("## Visual language");
  lines.push("");
  lines.push(
    field(
      data.primaryColour,
      "Primary colour",
      `Primary colour is ${data.primaryColour}. Use on CTAs and key moments only.`
    )
  );
  lines.push(
    field(
      data.secondaryColour,
      "Secondary colour",
      `Secondary / accent colour is ${data.secondaryColour}.`
    )
  );
  lines.push(
    field(
      data.background,
      "Background preference",
      `Background preference: ${data.background}.`
    )
  );
  lines.push(
    field(
      data.typography,
      "Typography",
      `Typography direction: ${data.typography}.`
    )
  );

  const spacingMap: Record<string, string> = {
    "Tight and dense":
      "Spacing is tight and dense. Compact layout, minimal whitespace.",
    Balanced: "Spacing is balanced. Standard padding and rhythm throughout.",
    "Open and airy":
      "Spacing is open and airy. Generous padding, never cramped.",
  };
  lines.push(
    field(
      data.spacing,
      "Spacing",
      spacingMap[data.spacing] || `Spacing: ${data.spacing}.`
    )
  );

  const radiusMap: Record<string, string> = {
    Sharp: "Border radius: sharp corners — 0–2px throughout.",
    Subtle: "Border radius: subtle rounding — 4–6px.",
    Soft: "Border radius: soft corners — 8–12px.",
    Pill: "Border radius: pill-shaped on interactive elements.",
  };
  lines.push(
    field(
      data.borderRadius,
      "Border radius",
      radiusMap[data.borderRadius] || `Border radius: ${data.borderRadius}.`
    )
  );

  lines.push(
    field(
      data.aestheticReference,
      "Aesthetic reference",
      `Aesthetic reference: ${data.aestheticReference}.`
    )
  );
  lines.push("");

  // --- Component conventions ---
  lines.push("---");
  lines.push("");
  lines.push("## Component conventions");
  lines.push("");
  lines.push(
    field(
      data.buttonHierarchy,
      "Button hierarchy",
      `Button hierarchy: ${data.buttonHierarchy}`
    )
  );
  lines.push(
    field(
      data.navigationPattern,
      "Navigation pattern",
      `Navigation pattern: ${data.navigationPattern}.`
    )
  );

  if (data.usesCards === true) {
    lines.push(
      field(
        data.cardsDescription,
        "Cards",
        `Cards are used. ${data.cardsDescription}`
      )
    );
  } else if (data.usesCards === false) {
    lines.push("No card pattern used in this project.");
  } else {
    lines.push("<!-- Cards: not specified — use your judgment -->");
  }

  lines.push(
    field(
      data.formFields,
      "Form field style",
      `Form fields: ${data.formFields} style.`
    )
  );
  lines.push(
    field(data.iconStyle, "Icon style", `Icons: ${data.iconStyle}.`)
  );
  lines.push("");

  // --- Interaction principles ---
  lines.push("---");
  lines.push("");
  lines.push("## Interaction principles");
  lines.push("");

  const motionMap: Record<string, string> = {
    None: "No motion. Static transitions only. Do not add animations.",
    Subtle:
      "Subtle motion — 150ms ease, purposeful transitions only. Nothing decorative.",
    Expressive:
      "Expressive motion — animation is part of the product personality. Use it with intent.",
  };
  lines.push(
    field(
      data.motion,
      "Motion preference",
      motionMap[data.motion] || `Motion: ${data.motion}.`
    )
  );
  lines.push(
    field(
      data.uiResponseFeel,
      "UI response feel",
      `UI response feel: ${data.uiResponseFeel}`
    )
  );
  lines.push(
    field(
      data.loadingStates,
      "Loading states",
      `Loading states: ${data.loadingStates}.`
    )
  );
  lines.push(
    field(
      data.errorHandling,
      "Error handling",
      `Errors surface as: ${data.errorHandling}.`
    )
  );
  lines.push("");

  // --- Tone and voice ---
  lines.push("---");
  lines.push("");
  lines.push("## Tone and voice");
  lines.push("");
  lines.push(
    field(
      data.copyTone,
      "Copy tone",
      `Copy tone: ${data.copyTone}. Apply to all UI copy — labels, CTAs, tooltips, and empty states.`
    )
  );
  lines.push(
    field(
      data.errorMessages,
      "Error message style",
      `Error messages: ${data.errorMessages}. Always say what went wrong and what to do next.`
    )
  );
  lines.push(
    field(
      data.emptyStates,
      "Empty states",
      `Empty states: ${data.emptyStates}.`
    )
  );
  lines.push(
    field(
      data.languageToAvoid,
      "Language to avoid",
      `Language to avoid: ${data.languageToAvoid}`
    )
  );
  lines.push("");

  // --- Constraints ---
  lines.push("---");
  lines.push("");
  lines.push("## Constraints and anti-patterns");
  lines.push("");
  lines.push(
    field(
      data.antiPatterns,
      "Anti-patterns",
      data.antiPatterns
    )
  );
  lines.push(
    field(
      data.accessibility,
      "Accessibility commitment",
      `Accessibility target: ${data.accessibility}.`
    )
  );
  lines.push(
    field(
      data.deviceTarget,
      "Device target",
      `Device target: ${data.deviceTarget}.`
    )
  );
  lines.push(
    field(
      data.browserTargets,
      "Browser targets",
      `Browser targets: ${data.browserTargets}.`
    )
  );
  lines.push("");

  // --- Free form ---
  if (data.freeForm) {
    lines.push("---");
    lines.push("");
    lines.push("## Additional context");
    lines.push("");
    lines.push(data.freeForm);
    lines.push("");
  }

  return lines.join("\n");
}
