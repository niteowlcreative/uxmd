"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { FormData } from "./types";
import { initialFormData } from "./types";
import { generateDesignMd } from "./generateDesignMd";
import ProgressDots from "./ProgressDots";
import StepFields, { STEP_META } from "./StepFields";
import LivePreview from "./LivePreview";

const TOTAL_STEPS = 7;

interface QuestionnaireProps {
  onReset: () => void;
}

export default function Questionnaire({ onReset }: QuestionnaireProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [nameError, setNameError] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChange = useCallback(
    (field: keyof FormData, value: string | boolean | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (typeof value === "string") {
        setIsTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setIsTyping(false), 800);
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && !formData.projectName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentStep, formData.projectName]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentStep]);

  const handleDownload = useCallback(() => {
    const content = generateDesignMd(formData);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DESIGN.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [formData]);

  const stepMeta = STEP_META[currentStep - 1];

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 32px 64px",
        width: "100%",
      }}
    >
      {/* Guidance banner */}
      <div
        style={{
          borderLeft: "2px solid var(--uxmd-pink)",
          background: "rgba(247,37,133,0.06)",
          borderRadius: "0 4px 4px 0",
          padding: "8px 12px",
          marginBottom: "28px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "12px",
            color: "var(--uxmd-text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          The more specific you are, the less your AI tool has to guess. Treat
          this like a brief — not a form.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="questionnaire-layout">
        {/* Left — step content */}
        <div className="questionnaire-left">
          {!isComplete ? (
            <>
              {/* Progress dots */}
              <ProgressDots currentStep={currentStep} />

              {/* Step counter */}
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "12px",
                  color: "var(--uxmd-text-muted)",
                  marginBottom: "4px",
                }}
              >
                Step {currentStep} of {TOTAL_STEPS}
              </p>

              {/* Step title */}
              <h2
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "28px",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  color: "var(--uxmd-text)",
                  marginBottom: "8px",
                  lineHeight: 1.1,
                }}
              >
                {stepMeta.title}
              </h2>

              {/* Step context line */}
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "13px",
                  color: "var(--uxmd-text-muted)",
                  marginBottom: "28px",
                  lineHeight: 1.5,
                }}
              >
                {stepMeta.context}
              </p>

              {/* Fields */}
              {nameError && (
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "13px",
                    color: "var(--uxmd-pink)",
                    marginBottom: "12px",
                  }}
                >
                  Project name is required to continue.
                </p>
              )}
              <StepFields
                step={currentStep}
                formData={formData}
                onChange={onChange}
                onEnter={handleNext}
              />

              {/* Navigation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    style={{
                      background: "transparent",
                      color: "var(--uxmd-text-muted)",
                      border: "0.5px solid var(--uxmd-border-strong)",
                      padding: "8px 20px",
                      borderRadius: "0.5rem",
                      fontFamily: "var(--font-bebas)",
                      fontSize: "16px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 150ms ease",
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
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    background: "var(--uxmd-pink)",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "none",
                    padding: "9px 24px",
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
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  {currentStep === TOTAL_STEPS ? "Generate" : "Next"}
                </button>

                {/* Skip — not shown on step 1 */}
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    style={{
                      marginLeft: "auto",
                      background: "none",
                      border: "none",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      color: "var(--uxmd-text-muted)",
                      cursor: "pointer",
                      padding: "0",
                      transition: "color 150ms ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--uxmd-text)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--uxmd-text-muted)")
                    }
                  >
                    Skip this step →
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Completion state */
            <div style={{ paddingTop: "40px" }}>
              <h2
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "48px",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  color: "var(--uxmd-text)",
                  lineHeight: 1.05,
                  marginBottom: "16px",
                }}
              >
                Your DESIGN.MD is Ready
              </h2>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "15px",
                  color: "var(--uxmd-text-muted)",
                  marginBottom: "32px",
                  maxWidth: "480px",
                  lineHeight: 1.6,
                }}
              >
                Drop this file into your project folder and paste it into your
                Claude Code, Cursor, or Codex session before you build.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    background: "var(--uxmd-pink)",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "none",
                    padding: "9px 24px",
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
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Download DESIGN.MD
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  style={{
                    background: "transparent",
                    color: "var(--uxmd-text-muted)",
                    border: "0.5px solid var(--uxmd-border-strong)",
                    padding: "8px 20px",
                    borderRadius: "0.5rem",
                    fontFamily: "var(--font-bebas)",
                    fontSize: "16px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 150ms ease",
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
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — live preview */}
        <div className="questionnaire-right">
          <LivePreview formData={formData} isTyping={isTyping} />
        </div>
      </div>
    </div>
  );
}
