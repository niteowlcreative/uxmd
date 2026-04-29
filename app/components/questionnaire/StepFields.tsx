"use client";

import { useState } from "react";
import { Globe, PenTool, Edit3 } from "lucide-react";
import type { FormData } from "./types";
import ButtonGroup from "./ButtonGroup";
import SiteImporter from "./SiteImporter";

interface StepFieldsProps {
  step: number;
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | null) => void;
  onEnter: () => void;
}

// ─── shared style tokens ────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "13px",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--uxmd-text-muted)",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--uxmd-surface-2)",
  border: "0.5px solid var(--uxmd-border-strong)",
  borderRadius: "6px",
  padding: "10px 14px",
  color: "var(--uxmd-text)",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "16px",
  outline: "none",
};

const helperStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans)",
  fontSize: "14px",
  color: "var(--uxmd-text-dim)",
  marginTop: "6px",
  lineHeight: 1.5,
};

const fieldGap: React.CSSProperties = { marginBottom: "24px" };

// ─── step 2 import mode ──────────────────────────────────────────────────────

type ImportMode = "none" | "website" | "figma" | "manual" | "review";

// ─── helpers ────────────────────────────────────────────────────────────────

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={fieldGap}>
      <label style={labelStyle}>{label}</label>
      {children}
      {helper && <p style={helperStyle}>{helper}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  onKeyDown,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={(e) =>
        (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(247,37,133,0.4)")
      }
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      onKeyDown={onKeyDown}
    />
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle,
        resize: "vertical",
        lineHeight: 1.6,
        minHeight: `${rows * 28}px`,
      }}
      onFocus={(e) =>
        (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(247,37,133,0.4)")
      }
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
    />
  );
}

// ─── step 2 component (has local import-mode state) ─────────────────────────

interface Step2FieldsProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string | boolean | null) => void;
  onEnter: () => void;
}

function Step2Fields({ formData, onChange, onEnter }: Step2FieldsProps) {
  const [importMode, setImportMode] = useState<ImportMode>("none");
  const [importedDomain, setImportedDomain] = useState("");

  const enterHandler =
    (): React.KeyboardEventHandler<HTMLInputElement> =>
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter();
      }
    };

  /* ── option cards ───────────────────────────────────── */

  const OPTIONS: {
    id: "website" | "figma" | "manual";
    icon: React.ReactNode;
    label: string;
    desc: string;
  }[] = [
    {
      id: "website",
      icon: <Globe size={20} strokeWidth={1.5} />,
      label: "Import from a website",
      desc: "Paste a URL and we'll extract your site's visual identity",
    },
    {
      id: "figma",
      icon: <PenTool size={20} strokeWidth={1.5} />,
      label: "Import from Figma",
      desc: "Paste a public Figma link to pull your design tokens",
    },
    {
      id: "manual",
      icon: <Edit3 size={20} strokeWidth={1.5} />,
      label: "Start from scratch",
      desc: "Fill in your visual language manually",
    },
  ];

  const cardStyle = (id: "website" | "figma" | "manual"): React.CSSProperties => {
    const active = importMode === id || (importMode === "review" && id === "website");
    return {
      flex: "1 1 0",
      background: active ? "var(--uxmd-pink-muted)" : "var(--uxmd-surface)",
      border: active ? "1px solid #F72585" : "0.5px solid var(--uxmd-border)",
      borderRadius: "10px",
      padding: "20px",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      transition: "border-color 150ms ease, background 150ms ease",
    };
  };

  const handleCardClick = (id: "website" | "figma" | "manual") => {
    if (id === "figma") {
      setImportMode("figma");
    } else if (id === "manual") {
      setImportMode("manual");
    } else {
      setImportMode("website");
    }
  };

  /* ── manual form fields (reused for both manual and review) ── */

  const ManualFields = () => (
    <div style={{ marginTop: "24px" }}>
      <Field
        label="Primary Colour"
        helper="Hex values are ideal. If you don't have one yet, describe the feeling."
      >
        <TextInput
          value={formData.primaryColour}
          onChange={(v) => onChange("primaryColour", v)}
          placeholder="#1A1A2E or 'deep navy — used only on CTAs and key moments'"
          onKeyDown={enterHandler()}
        />
      </Field>
      <Field label="Secondary / Accent">
        <TextInput
          value={formData.secondaryColour}
          onChange={(v) => onChange("secondaryColour", v)}
          placeholder="#F72585 or 'electric pink — high contrast against dark backgrounds'"
          onKeyDown={enterHandler()}
        />
      </Field>
      <Field
        label="Background"
        helper="This affects every surface decision your AI makes."
      >
        <ButtonGroup
          options={["Light", "Dark", "Both"]}
          value={formData.background}
          onChange={(v) => onChange("background", v)}
        />
      </Field>
      <Field
        label="Typography"
        helper="Font name is ideal. A style description works if you're still deciding."
      >
        <TextInput
          value={formData.typography}
          onChange={(v) => onChange("typography", v)}
          placeholder="Inter, clean sans-serif / Editorial serif / Friendly and rounded"
          onKeyDown={enterHandler()}
        />
      </Field>
      <Field label="Spacing">
        <ButtonGroup
          options={["Tight and dense", "Balanced", "Open and airy"]}
          value={formData.spacing}
          onChange={(v) => onChange("spacing", v)}
        />
      </Field>
      <Field label="Border Radius">
        <ButtonGroup
          options={["Sharp", "Subtle", "Soft", "Pill"]}
          value={formData.borderRadius}
          onChange={(v) => onChange("borderRadius", v)}
        />
      </Field>
      <Field
        label="Aesthetic Reference"
        helper="Name a product, a material, a feeling. This is the most useful field on this step — don't leave it blank."
      >
        <TextInput
          value={formData.aestheticReference}
          onChange={(v) => onChange("aestheticReference", v)}
          placeholder="'Think Linear meets Notion' or 'Warm, earthy, approachable'"
          onKeyDown={enterHandler()}
        />
      </Field>
    </div>
  );

  return (
    <div>
      {/* Heading */}
      <p
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "20px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--uxmd-text-muted)",
          marginBottom: "16px",
        }}
      >
        Do you have existing design assets?
      </p>

      {/* Three option cards */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "4px" }}>
        {OPTIONS.map((opt) => (
          <div
            key={opt.id}
            style={cardStyle(opt.id)}
            onClick={() => handleCardClick(opt.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(opt.id);
              }
            }}
          >
            <span
              style={{
                color:
                  importMode === opt.id || (importMode === "review" && opt.id === "website")
                    ? "#F72585"
                    : "var(--uxmd-text-muted)",
                transition: "color 150ms ease",
              }}
            >
              {opt.icon}
            </span>
            <span
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "16px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--uxmd-text)",
                lineHeight: 1.2,
              }}
            >
              {opt.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
                color: "var(--uxmd-text-muted)",
                lineHeight: 1.4,
              }}
            >
              {opt.desc}
            </span>
          </div>
        ))}
      </div>

      {/* ── Website import flow ──────────────────────────── */}
      {importMode === "website" && (
        <SiteImporter
          onComplete={(fields, domain) => {
            // Apply extracted fields to formData
            for (const [key, value] of Object.entries(fields)) {
              onChange(key as keyof FormData, value as string | boolean | null);
            }
            setImportedDomain(domain);
            setImportMode("review");
          }}
          onSkipToManual={() => setImportMode("manual")}
        />
      )}

      {/* ── Review state after import ─────────────────────── */}
      {importMode === "review" && (
        <>
          {/* Confidence banner */}
          <div
            style={{
              borderLeft: "2px solid var(--uxmd-pink)",
              background: "rgba(247,37,133,0.06)",
              borderRadius: "0 4px 4px 0",
              padding: "8px 12px",
              marginTop: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                color: "var(--uxmd-text-muted)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              We extracted the following from{" "}
              <span style={{ color: "var(--uxmd-text)" }}>{importedDomain}</span>. Review
              each field and adjust anything that doesn&rsquo;t look right.
            </p>
          </div>
          <ManualFields />
        </>
      )}

      {/* ── Manual (Start from scratch) ───────────────────── */}
      {importMode === "manual" && <ManualFields />}

      {/* ── Figma placeholder ─────────────────────────────── */}
      {importMode === "figma" && (
        <div
          style={{
            marginTop: "20px",
            background: "var(--uxmd-surface)",
            border: "0.5px solid var(--uxmd-border)",
            borderRadius: "10px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "20px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--uxmd-text)",
            }}
          >
            Coming Soon
          </p>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              color: "var(--uxmd-text-muted)",
              lineHeight: 1.5,
              maxWidth: "360px",
            }}
          >
            Figma import is in development. For now, use the website import or fill in your
            visual language manually.
          </p>
          <button
            type="button"
            onClick={() => setImportMode("manual")}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              color: "var(--uxmd-text-muted)",
              border: "0.5px solid var(--uxmd-border-strong)",
              padding: "8px 20px",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-bebas)",
              fontSize: "18px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 150ms ease",
              marginTop: "4px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--uxmd-surface-2)";
              e.currentTarget.style.color = "var(--uxmd-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--uxmd-text-muted)";
            }}
          >
            Fill in manually instead
          </button>
        </div>
      )}
    </div>
  );
}

// ─── step content ────────────────────────────────────────────────────────────

const STEP_META = [
  {
    title: "Project Identity",
    context:
      "This anchors everything. A clear project name and purpose prevents your AI from making assumptions about what it's building.",
  },
  {
    title: "Visual Language",
    context:
      "This is where most AI tools go wrong. 'Use blue' is not a design direction. The more specific you are here, the less your AI guesses.",
  },
  {
    title: "Component Conventions",
    context:
      "Components are where design intent breaks down fastest. Tell your AI how things should behave before it invents its own rules.",
  },
  {
    title: "Interaction Principles",
    context:
      "Interaction decisions made here prevent your AI from adding animations you didn't ask for, or missing transitions that matter.",
  },
  {
    title: "Tone and Voice",
    context:
      "UI copy is part of the design. If your AI writes error messages in the wrong voice, it breaks the experience even if the layout is perfect.",
  },
  {
    title: "Constraints and Anti-Patterns",
    context:
      "What your AI should never do is as important as what it should. This step prevents the mistakes that are hardest to undo.",
  },
  {
    title: "Free-Form Context",
    context:
      "This is your escape hatch. Everything the previous steps didn't capture lives here. The designers who fill this in well get dramatically better AI output.",
  },
];

export { STEP_META };

export default function StepFields({
  step,
  formData,
  onChange,
  onEnter,
}: StepFieldsProps) {
  const enterHandler =
    (enabled = true): React.KeyboardEventHandler<HTMLInputElement> =>
    (e) => {
      if (enabled && e.key === "Enter") {
        e.preventDefault();
        onEnter();
      }
    };

  if (step === 1) {
    return (
      <div>
        <Field
          label="Project Name"
          helper="This will appear at the top of your DESIGN.md file."
        >
          <TextInput
            value={formData.projectName}
            onChange={(v) => onChange("projectName", v)}
            placeholder="e.g. Folia, Beacon, Clearpath"
            onKeyDown={enterHandler()}
          />
        </Field>
        <Field
          label="What Does It Do?"
          helper="One sentence only. If you need more, it's two products."
        >
          <TextInput
            value={formData.whatItDoes}
            onChange={(v) => onChange("whatItDoes", v)}
            placeholder="Describe it in one sentence."
            onKeyDown={enterHandler()}
          />
        </Field>
        <Field
          label="Who Is It For?"
          helper="E.g. 'Freelance photographers who sell prints online' not 'Creative Pro, 28–45'."
        >
          <TextInput
            value={formData.whoIsItFor}
            onChange={(v) => onChange("whoIsItFor", v)}
            placeholder="Describe the person using it — not a persona, just plain language."
            onKeyDown={enterHandler()}
          />
        </Field>
        <Field
          label="How Should It Make Users Feel?"
          helper="This shapes tone, motion, and interaction density more than you'd expect. Don't skip it."
        >
          <TextInput
            value={formData.howItFeels}
            onChange={(v) => onChange("howItFeels", v)}
            placeholder="Confident. Calm and in control. Like an expert."
            onKeyDown={enterHandler()}
          />
        </Field>
      </div>
    );
  }

  if (step === 2) {
    return <Step2Fields formData={formData} onChange={onChange} onEnter={onEnter} />;
  }

  if (step === 3) {
    return (
      <div>
        <Field
          label="Button Hierarchy"
          helper="Describe how your buttons differ from each other — not just visually but in terms of when to use each."
        >
          <TextInput
            value={formData.buttonHierarchy}
            onChange={(v) => onChange("buttonHierarchy", v)}
            placeholder="Primary = filled, Secondary = outlined, Destructive = red text only"
            onKeyDown={enterHandler()}
          />
        </Field>
        <Field label="Navigation Pattern">
          <ButtonGroup
            options={["Top nav", "Sidebar", "Bottom nav", "Not decided yet"]}
            value={formData.navigationPattern}
            onChange={(v) => onChange("navigationPattern", v)}
          />
        </Field>
        <Field label="Cards">
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {(["Yes", "No"] as const).map((opt) => {
              const isSelected =
                opt === "Yes"
                  ? formData.usesCards === true
                  : formData.usesCards === false;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    onChange("usesCards", opt === "Yes" ? true : false)
                  }
                  style={{
                    background: isSelected
                      ? "var(--uxmd-purple-muted)"
                      : "transparent",
                    color: isSelected
                      ? "var(--uxmd-purple)"
                      : "var(--uxmd-text-muted)",
                    border: isSelected
                      ? "0.5px solid var(--uxmd-purple)"
                      : "0.5px solid var(--uxmd-border-strong)",
                    borderRadius: "6px",
                    padding: "6px 14px",
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {formData.usesCards === true && (
            <TextArea
              value={formData.cardsDescription}
              onChange={(v) => onChange("cardsDescription", v)}
              placeholder="Describe how you use them — content type, hover behaviour, nesting rules"
              rows={3}
            />
          )}
        </Field>
        <Field label="Form Fields">
          <ButtonGroup
            options={["Outlined", "Filled", "Underline", "Floating label"]}
            value={formData.formFields}
            onChange={(v) => onChange("formFields", v)}
          />
        </Field>
        <Field label="Icons">
          <ButtonGroup
            options={["Outlined", "Filled", "Custom", "No icons"]}
            value={formData.iconStyle}
            onChange={(v) => onChange("iconStyle", v)}
          />
        </Field>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div>
        <Field
          label="Motion"
          helper="Subtle = 150ms ease, purposeful only. Expressive = motion is part of the personality."
        >
          <ButtonGroup
            options={["None", "Subtle", "Expressive"]}
            value={formData.motion}
            onChange={(v) => onChange("motion", v)}
          />
        </Field>
        <Field
          label="UI Response Feel"
          helper="Think about the last app that felt right to use. What did tapping a button feel like?"
        >
          <TextInput
            value={formData.uiResponseFeel}
            onChange={(v) => onChange("uiResponseFeel", v)}
            placeholder="Snappy and immediate / Smooth and deliberate / Satisfying with weight"
            onKeyDown={enterHandler()}
          />
        </Field>
        <Field label="Are Loading States Important?">
          <ButtonGroup
            options={[
              "Yes — detail them",
              "Not critical",
              "No data loading in this project",
            ]}
            value={formData.loadingStates}
            onChange={(v) => onChange("loadingStates", v)}
          />
        </Field>
        <Field label="How Should Errors Surface?">
          <ButtonGroup
            options={["Inline", "Toast", "Modal", "Full page"]}
            value={formData.errorHandling}
            onChange={(v) => onChange("errorHandling", v)}
          />
        </Field>
      </div>
    );
  }

  if (step === 5) {
    return (
      <div>
        <Field label="Copy Tone">
          <ButtonGroup
            options={["Formal", "Professional", "Casual", "Playful", "Dry"]}
            value={formData.copyTone}
            onChange={(v) => onChange("copyTone", v)}
          />
        </Field>
        <Field
          label="Error Messages"
          helper="Good error messages say what went wrong AND what to do next. This setting tells your AI which voice to use when writing them."
        >
          <ButtonGroup
            options={["Clinical and direct", "Helpful and human", "Apologetic"]}
            value={formData.errorMessages}
            onChange={(v) => onChange("errorMessages", v)}
          />
        </Field>
        <Field label="Empty States">
          <ButtonGroup
            options={["Helpful and guiding", "Minimal", "Illustrated"]}
            value={formData.emptyStates}
            onChange={(v) => onChange("emptyStates", v)}
          />
        </Field>
        <Field
          label="Language to Avoid"
          helper="Optional but powerful. Brand voice rules belong here."
        >
          <TextInput
            value={formData.languageToAvoid}
            onChange={(v) => onChange("languageToAvoid", v)}
            placeholder="E.g. 'Never say sorry. No exclamation marks. Avoid the word seamless.'"
            onKeyDown={enterHandler()}
          />
        </Field>
      </div>
    );
  }

  if (step === 6) {
    return (
      <div>
        <Field
          label="What Should This UI Never Do?"
          helper="Think about patterns you've seen that broke a product. List them here so they never appear in yours."
        >
          <TextArea
            value={formData.antiPatterns}
            onChange={(v) => onChange("antiPatterns", v)}
            placeholder="Never use carousels. Never hide the primary action. Never show empty tables."
            rows={4}
          />
        </Field>
        <Field
          label="Accessibility Commitment"
          helper="If you're building for Canada, AODA is the legal standard. WCAG AA is a solid baseline for everyone else."
        >
          <ButtonGroup
            options={["Decorative only", "WCAG AA", "WCAG AAA", "AODA"]}
            value={formData.accessibility}
            onChange={(v) => onChange("accessibility", v)}
          />
        </Field>
        <Field label="Primary Device">
          <ButtonGroup
            options={["Desktop first", "Mobile first", "Both equally"]}
            value={formData.deviceTarget}
            onChange={(v) => onChange("deviceTarget", v)}
          />
        </Field>
        <Field label="Browser Targets">
          <ButtonGroup
            options={[
              "Modern only",
              "Legacy support needed",
              "No preference",
            ]}
            value={formData.browserTargets}
            onChange={(v) => onChange("browserTargets", v)}
          />
        </Field>
      </div>
    );
  }

  if (step === 7) {
    return (
      <div>
        <Field
          label="Anything Else Your AI Should Know?"
          helper="Treat this like the 'any other context?' section of a design brief. Senior designers always fill it in."
        >
          <TextArea
            value={formData.freeForm}
            onChange={(v) => onChange("freeForm", v)}
            placeholder="Paste research notes, describe edge cases, name competitors you don't want to look like, explain what makes this project unusual. Nothing here is required — but everything here pays off."
            rows={10}
          />
        </Field>
      </div>
    );
  }

  return null;
}
