"use client";

import type { FormData } from "./types";
import ButtonGroup from "./ButtonGroup";

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
  fontSize: "11px",
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
  fontSize: "14px",
  outline: "none",
};

const helperStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans)",
  fontSize: "12px",
  color: "var(--uxmd-text-dim)",
  marginTop: "6px",
  lineHeight: 1.5,
};

const fieldGap: React.CSSProperties = { marginBottom: "24px" };

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
    return (
      <div>
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
                    fontSize: "13px",
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
