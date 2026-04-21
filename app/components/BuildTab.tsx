"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import Questionnaire from "./questionnaire/Questionnaire";

interface BuildTabProps {
  user: User | null;
}

export default function BuildTab({ user }: BuildTabProps) {
  const [started, setStarted] = useState(false);

  if (started) {
    return (
      <div className="questionnaire-enter">
        <Questionnaire
          onReset={() => setStarted(false)}
          isLoggedIn={!!user}
          userId={user?.id}
        />
      </div>
    );
  }

  return (
    <div className="entry-state flex flex-col items-center justify-center flex-1 gap-6 px-8 py-24">
      <div className="text-center max-w-lg">
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "15px",
            color: "var(--uxmd-text-muted)",
            marginBottom: "32px",
          }}
        >
          Generate a{" "}
          <code
            style={{
              fontFamily: "monospace",
              color: "var(--uxmd-pink)",
              fontSize: "14px",
            }}
          >
            DESIGN.md
          </code>{" "}
          file that primes AI coding tools with your project&rsquo;s visual
          language, component conventions, and design intent.
        </p>

        {/* Three-step explainer */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "0",
            marginBottom: "32px",
            flexWrap: "wrap",
          }}
        >
          {[
            { num: "01", text: "Answer 7 questions about your project" },
            {
              num: "02",
              text: "Your DESIGN.md is generated live as you go",
            },
            {
              num: "03",
              text: "Download one file. Drop it in your project folder.",
            },
          ].map((step, i, arr) => (
            <div
              key={step.num}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "0 24px",
                borderRight:
                  i < arr.length - 1
                    ? "0.5px solid rgba(255,255,255,0.1)"
                    : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "11px",
                  letterSpacing: "0.06em",
                  color: "var(--uxmd-pink)",
                }}
              >
                {step.num}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  color: "var(--uxmd-text-muted)",
                  maxWidth: "160px",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {step.text}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          style={{
            background: "var(--uxmd-pink)",
            color: "#ffffff",
            border: "none",
            boxShadow: "none",
            padding: "9px 20px",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-bebas)",
            fontSize: "16px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "filter 150ms ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.filter = "brightness(1.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.filter = "brightness(1)")
          }
          onMouseDown={(e) =>
            (e.currentTarget.style.transform = "scale(0.98)")
          }
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Start a new project
        </button>

        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12px",
            color: "var(--uxmd-text-dim)",
            marginTop: "16px",
            letterSpacing: "0.02em",
          }}
        >
          No account needed.{" "}
          {user ? (
            <span style={{ color: "var(--uxmd-text-dim)" }}>
              Signed in as {user.email}.
            </span>
          ) : (
            <span
              style={{
                color: "var(--uxmd-text-dim)",
                textDecoration: "line-through",
                cursor: "not-allowed",
              }}
              title="Available in Phase 2"
            >
              Create an account to save your history.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
