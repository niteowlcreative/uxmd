"use client";

import { useMemo } from "react";
import type { FormData } from "./types";
import { generateDesignMd } from "./generateDesignMd";

interface LivePreviewProps {
  formData: FormData;
  isTyping: boolean;
}

function isSectionPopulated(section: string, data: FormData): boolean {
  switch (section) {
    case "Project overview":
      return !!(data.whatItDoes || data.whoIsItFor || data.howItFeels);
    case "Visual language":
      return !!(
        data.primaryColour ||
        data.secondaryColour ||
        data.background ||
        data.typography ||
        data.spacing ||
        data.borderRadius ||
        data.aestheticReference
      );
    case "Component conventions":
      return !!(
        data.buttonHierarchy ||
        data.navigationPattern ||
        data.usesCards !== null ||
        data.formFields ||
        data.iconStyle
      );
    case "Interaction principles":
      return !!(
        data.motion ||
        data.uiResponseFeel ||
        data.loadingStates ||
        data.errorHandling
      );
    case "Tone and voice":
      return !!(
        data.copyTone ||
        data.errorMessages ||
        data.emptyStates ||
        data.languageToAvoid
      );
    case "Constraints and anti-patterns":
      return !!(
        data.antiPatterns ||
        data.accessibility ||
        data.deviceTarget ||
        data.browserTargets
      );
    case "Additional context":
      return !!data.freeForm;
    default:
      return false;
  }
}

export default function LivePreview({ formData, isTyping }: LivePreviewProps) {
  const content = useMemo(() => generateDesignMd(formData), [formData]);

  const lines = content.split("\n");

  return (
    <div
      style={{
        background: "var(--uxmd-surface)",
        border: "0.5px solid var(--uxmd-border)",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
        minHeight: "400px",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "0.5px solid var(--uxmd-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--uxmd-text-dim)",
          }}
        >
          DESIGN.md
        </span>
        {isTyping && (
          <span
            className="preview-generating"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
              color: "var(--uxmd-pink)",
              letterSpacing: "0.04em",
            }}
          >
            Generating…
          </span>
        )}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
        }}
      >
        <pre
          style={{
            fontFamily: "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace",
            fontSize: "14px",
            lineHeight: 1.7,
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {lines.map((line, i) => {
            const isSectionHeader = line.startsWith("## ");
            const sectionName = isSectionHeader ? line.replace("## ", "") : "";
            const populated = isSectionHeader
              ? isSectionPopulated(sectionName, formData)
              : false;

            const isH1 = line.startsWith("# ");
            const isMeta = line.startsWith("**") || line.startsWith(">");
            const isComment = line.startsWith("<!--");
            const isHr = line === "---";

            let color: string;
            if (isSectionHeader && populated) {
              color = "var(--uxmd-pink)";
            } else if (isSectionHeader || isH1) {
              color = "var(--uxmd-text)";
            } else if (isComment) {
              color = "var(--uxmd-text-dim)";
            } else if (isHr) {
              color = "var(--uxmd-border-strong)";
            } else if (isMeta) {
              color = "var(--uxmd-text-muted)";
            } else {
              color = "var(--uxmd-text)";
            }

            return (
              <span
                key={i}
                style={{
                  color,
                  display: "block",
                  transition: "color 300ms ease",
                }}
              >
                {line || "\u200B"}
              </span>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
