"use client";

import { useState } from "react";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "what-is-design-md",
    title: "What is DESIGN.md?",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p>
          DESIGN.md is a plain-text file that tells an AI coding tool everything
          it needs to know about your project&rsquo;s visual language before it
          writes a single line of code.
        </p>
        <p>
          AI tools like Claude Code, Cursor, and GitHub Copilot are stateless.
          They don&rsquo;t remember your last conversation. They don&rsquo;t
          know your brand colour or why your buttons are pill-shaped. Without
          context, they generate generic output — technically correct, visually
          wrong.
        </p>
        <p>
          Paste a DESIGN.md into your session and the model has a complete
          brief: your palette, your type scale, your component conventions, your
          anti-patterns. The difference between prompting blind and prompting
          with intent.
        </p>
        <div
          style={{
            background: "var(--uxmd-surface-2)",
            border: "0.5px solid var(--uxmd-border)",
            borderRadius: "6px",
            padding: "16px 20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "13px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--uxmd-text-dim)",
              marginBottom: "8px",
            }}
          >
            The rule
          </p>
          <p style={{ color: "var(--uxmd-text)" }}>
            Context before code. Every time.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "how-to-write-a-good-prompt",
    title: "How to write a good prompt",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p>
          A good prompt is specific about constraints and flexible about
          implementation. Lead with what cannot change. End with what you want.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {[
            {
              label: "Front-load constraints",
              body: "Start with what must be true. Colours, patterns, things to avoid. If you say it at the end, the model has already made decisions.",
            },
            {
              label: "Describe intent before deliverable",
              body: "\"A card that communicates urgency without alarming the user\" gives more than \"a red card.\" Tell the model what the component needs to do for the user.",
            },
            {
              label: "The architect prompt pattern",
              body: "Before asking for code, ask: \"Review my DESIGN.md and describe how you'd approach building [X]. Don't write code yet.\" Review the plan, then build.",
            },
            {
              label: "Specificity vs. brevity",
              body: "Short prompts get generic output. Long prompts with noise get confused output. Aim for dense and precise: every word earns its place.",
            },
          ].map(({ label, body }) => (
            <div
              key={label}
              style={{
                background: "var(--uxmd-surface)",
                border: "0.5px solid var(--uxmd-border)",
                borderRadius: "6px",
                padding: "14px 16px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: 500,
                  fontSize: "14px",
                  color: "var(--uxmd-text)",
                  marginBottom: "6px",
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  color: "var(--uxmd-text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "micro-prompt-theory",
    title: "Micro-prompt theory",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p>
          One large prompt produces one large output that&rsquo;s 80% right and
          20% wrong — and the 20% is tangled into the 80%. You spend more time
          fixing than you would have spent building incrementally.
        </p>
        <p>
          Micro-prompts are small, precise asks. One component at a time. One
          concern at a time. Each prompt assumes the last one worked.
        </p>

        <div
          style={{
            background: "var(--uxmd-surface-2)",
            border: "0.5px solid var(--uxmd-border)",
            borderRadius: "6px",
            padding: "16px 20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "13px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--uxmd-text-dim)",
              marginBottom: "12px",
            }}
          >
            Example chain
          </p>
          {[
            ["Bad", "Build me the entire onboarding flow with animations."],
            ["Better", "Build the first step of the onboarding form. Fields: name, email. No navigation yet."],
            ["Best", "The name input is correct. Now add the email input with inline validation. The error state uses the spec from my DESIGN.md."],
          ].map(([label, text]) => (
            <div key={label} style={{ marginBottom: "12px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  marginBottom: "6px",
                  background:
                    label === "Bad"
                      ? "var(--uxmd-pink-muted)"
                      : "var(--uxmd-purple-muted)",
                  color:
                    label === "Bad"
                      ? "var(--uxmd-pink)"
                      : "var(--uxmd-purple)",
                }}
              >
                {label}
              </span>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  color: "var(--uxmd-text-muted)",
                }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>

        <p>
          When to restart a session: when the model&rsquo;s context is polluted
          — too many failed attempts, contradictory instructions, or a direction
          you&rsquo;ve abandoned. A clean session with a clean DESIGN.md is
          faster than correcting a confused one.
        </p>
      </div>
    ),
  },
  {
    id: "keeping-design-md-alive",
    title: "Keeping DESIGN.md alive",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p>
          A DESIGN.md you generate once and never touch is a snapshot. Useful,
          but increasingly stale. The document is most valuable when it reflects
          decisions you&rsquo;ve actually made — not just ones you planned to
          make.
        </p>
        <p>Update it when:</p>
        <ul
          style={{
            paddingLeft: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {[
            "You add a new component type with its own conventions.",
            "You change the colour palette or introduce a new token.",
            "You discover an anti-pattern after getting burned by it.",
            "A design decision gets made that the AI keeps getting wrong.",
            "The tone or voice of the product shifts.",
          ].map((item) => (
            <li key={item} style={{ color: "var(--uxmd-text-muted)" }}>
              {item}
            </li>
          ))}
        </ul>
        <p>
          Treat it like a living brief — the same way a good designer updates a
          brand guide when the brand evolves, not when they feel like it.
        </p>
        <div
          style={{
            background: "var(--uxmd-surface-2)",
            border: "0.5px solid var(--uxmd-border)",
            borderRadius: "6px",
            padding: "16px 20px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "13px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--uxmd-text-dim)",
              marginBottom: "8px",
            }}
          >
            Versioning tip
          </p>
          <p style={{ color: "var(--uxmd-text-muted)" }}>
            Keep DESIGN.md in your repository root. Commit it alongside your
            code. The git history tells the story of how the design language
            evolved — and lets you recover decisions you later realise you
            shouldn&rsquo;t have changed.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "faq",
    title: "FAQ",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {[
          {
            q: "Does this work with tools other than Claude?",
            a: "Yes. DESIGN.md is plain markdown. Paste it into any AI coding tool — Cursor, GitHub Copilot, GPT/Codex, Gemini. The format is AI-agnostic.",
          },
          {
            q: "What if my project doesn't have a Figma file?",
            a: "Use the manual path in Step 2. You don't need Figma. Describe your colours, typography direction, spacing feel, and aesthetic in plain language. The AI will work with whatever specificity you give it.",
          },
          {
            q: "How long should my DESIGN.md be?",
            a: "Long enough to be useful, short enough to be read. A good DESIGN.md is 200–500 lines — enough to cover the full design language without becoming a second codebase. If it starts to resemble a component library, it's too long.",
          },
          {
            q: "Can I edit DESIGN.md manually after downloading?",
            a: "Absolutely. Download is just the starting point. Edit it in any text editor. Add sections, remove fields that don't apply, write in your own voice. The format is yours to own.",
          },
          {
            q: "Do I paste the whole file every session?",
            a: "With Claude Code, you can use the @ mention or /memory feature to load it automatically. With Cursor, add it to your .cursorrules or context window. With Copilot, keep it open in the editor. However you load it — load it every time.",
          },
        ].map(({ q, a }) => (
          <div
            key={q}
            style={{
              borderBottom: "0.5px solid var(--uxmd-border)",
              paddingBottom: "20px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontWeight: 500,
                fontSize: "15px",
                color: "var(--uxmd-text)",
                marginBottom: "8px",
              }}
            >
              {q}
            </p>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                color: "var(--uxmd-text-muted)",
                lineHeight: 1.6,
              }}
            >
              {a}
            </p>
          </div>
        ))}
      </div>
    ),
  },
];

export default function LearnTab() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const current = SECTIONS.find((s) => s.id === activeSection)!;

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 32px",
        display: "flex",
        gap: "48px",
        alignItems: "flex-start",
      }}
    >
      {/* Sidebar nav */}
      <aside
        style={{
          width: "220px",
          flexShrink: 0,
          position: "sticky",
          top: "40px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--uxmd-text-dim)",
            marginBottom: "12px",
          }}
        >
          Contents
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {SECTIONS.map((s) => {
            const isActive = s.id === activeSection;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  background: isActive
                    ? "var(--uxmd-surface-2)"
                    : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 12px",
                  textAlign: "left",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  color: isActive
                    ? "var(--uxmd-text)"
                    : "var(--uxmd-text-muted)",
                  cursor: "pointer",
                  transition: "background 150ms ease, color 150ms ease",
                  borderLeft: isActive
                    ? "2px solid var(--uxmd-pink)"
                    : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "var(--uxmd-surface-2)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {s.title}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <h2
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "36px",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: "var(--uxmd-text)",
            marginBottom: "24px",
          }}
        >
          {current.title}
        </h2>
        <div
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "15px",
            color: "var(--uxmd-text-muted)",
            lineHeight: 1.6,
          }}
        >
          {current.content}
        </div>
      </main>
    </div>
  );
}
