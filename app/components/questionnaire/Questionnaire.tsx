"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import type { FormData } from "./types";
import { initialFormData } from "./types";
import { generateDesignMd } from "./generateDesignMd";
import { createClient } from "@/lib/supabase/client";
import ProgressDots from "./ProgressDots";
import StepFields, { STEP_META } from "./StepFields";
import LivePreview from "./LivePreview";

const TOTAL_STEPS = 7;

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface QuestionnaireProps {
  onReset: () => void;
  // Auth / save props — all optional so existing BuildTab usage is unchanged
  isLoggedIn?: boolean;
  userId?: string;
  projectId?: string; // present when editing an existing project
  initialData?: Partial<FormData>; // pre-populate fields in edit mode
  editProjectName?: string; // shows "EDITING: [name]" above questionnaire
}

export default function Questionnaire({
  onReset,
  isLoggedIn = false,
  userId,
  projectId,
  initialData,
  editProjectName,
}: QuestionnaireProps) {
  const [formData, setFormData] = useState<FormData>({
    ...initialFormData,
    ...initialData,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
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

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    const supabase = createClient();
    const content = generateDesignMd(formData);

    if (projectId) {
      // Edit mode — update existing row
      const { error } = await supabase
        .from("projects")
        .update({
          design_md: content,
          answers: formData as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId);

      setSaveStatus(error ? "error" : "saved");
    } else {
      // New project — insert
      const { error } = await supabase.from("projects").insert({
        user_id: userId,
        project_name: formData.projectName || "Untitled",
        design_md: content,
        answers: formData as unknown as Record<string, unknown>,
      });

      setSaveStatus(error ? "error" : "saved");
    }
  }, [formData, projectId, userId]);

  const stepMeta = STEP_META[currentStep - 1];
  const isEditMode = !!projectId;

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
                      e.currentTarget.style.background =
                        "var(--uxmd-surface-2)";
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
            /* ── Completion state ── */
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

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                {/* Logged-in: Save CTA (above download, per spec) */}
                {isLoggedIn && (
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saveStatus === "saving" || saveStatus === "saved"}
                      style={{
                        background: "transparent",
                        color:
                          saveStatus === "saved"
                            ? "var(--uxmd-purple)"
                            : "var(--uxmd-purple)",
                        border:
                          saveStatus === "saved"
                            ? "1px solid var(--uxmd-purple)"
                            : "1px solid var(--uxmd-purple)",
                        padding: "8px 20px",
                        borderRadius: "0.5rem",
                        fontFamily: "var(--font-bebas)",
                        fontSize: "16px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        cursor:
                          saveStatus === "saving" || saveStatus === "saved"
                            ? "default"
                            : "pointer",
                        opacity:
                          saveStatus === "saving" || saveStatus === "saved"
                            ? 0.7
                            : 1,
                        transition: "all 150ms ease",
                      }}
                      onMouseEnter={(e) => {
                        if (saveStatus === "idle")
                          e.currentTarget.style.background =
                            "var(--uxmd-purple-muted)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {saveStatus === "saving"
                        ? "Saving…"
                        : saveStatus === "saved"
                        ? isEditMode
                          ? "Changes saved"
                          : "Saved"
                        : isEditMode
                        ? "Save changes"
                        : "Save to my projects"}
                    </button>

                    {/* Inline feedback */}
                    {saveStatus === "saved" && (
                      <span
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                          fontSize: "13px",
                          color: "var(--uxmd-text-muted)",
                        }}
                      >
                        {isEditMode ? (
                          "Updated."
                        ) : (
                          <>
                            Saved.{" "}
                            <Link
                              href="/dashboard"
                              style={{
                                color: "var(--uxmd-purple)",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                              }}
                            >
                              View in your dashboard.
                            </Link>
                          </>
                        )}
                      </span>
                    )}
                    {saveStatus === "error" && (
                      <span
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                          fontSize: "13px",
                          color: "var(--uxmd-pink)",
                        }}
                      >
                        Couldn&rsquo;t save right now. Download the file to
                        keep a copy.
                      </span>
                    )}
                  </div>
                )}

                {/* Download + Start Over row */}
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
                      e.currentTarget.style.background =
                        "var(--uxmd-surface-2)";
                      e.currentTarget.style.color = "var(--uxmd-text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--uxmd-text-muted)";
                    }}
                  >
                    {isEditMode ? "Back to Dashboard" : "Start Over"}
                  </button>
                </div>

                {/* Guest upsell */}
                {!isLoggedIn && (
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      color: "var(--uxmd-text-muted)",
                      marginTop: "4px",
                    }}
                  >
                    Want to save this and come back to it?{" "}
                    <Link
                      href="/login"
                      style={{
                        color: "var(--uxmd-purple)",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                      }}
                    >
                      Create a free account
                    </Link>
                  </p>
                )}
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
