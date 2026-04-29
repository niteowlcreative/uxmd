"use client";

import { useState, useEffect, useRef } from "react";
import type { FormData } from "./types";

/* ─── types ────────────────────────────────────────────── */

type ImportStep = "url-input" | "loading" | "error";

interface FigmaImporterProps {
  onComplete: (fields: Partial<FormData>, domain: string) => void;
  onSkipToManual: () => void;
}

/* ─── loading messages ─────────────────────────────────── */

const LOADING_MESSAGES = [
  "Connecting to Figma...",
  "Reading design tokens...",
  "Extracting colour styles...",
  "Analysing typography...",
  "Mapping component names...",
  "Almost there...",
];

/* ─── input style ──────────────────────────────────────── */

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

/* ─── URL validation ───────────────────────────────────── */

function isValidFigmaURL(v: string): boolean {
  return /figma\.com\/(design|file)\//i.test(v.trim());
}

/* ─── component ────────────────────────────────────────── */

export default function FigmaImporter({ onComplete, onSkipToManual }: FigmaImporterProps) {
  const [step, setStep] = useState<ImportStep>("url-input");
  const [url, setUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === "loading") {
      cycleRef.current = setInterval(() => {
        setLoadingMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
      }, 2000);
    } else {
      if (cycleRef.current) {
        clearInterval(cycleRef.current);
        cycleRef.current = null;
      }
      setLoadingMsgIndex(0);
    }
    return () => {
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [step]);

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    setStep("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/extract-figma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const msg =
          data.error === "fetch_failed"
            ? "Couldn't reach that Figma file. Make sure the link is public (Anyone with the link → can view)."
            : data.error === "invalid_url"
            ? "That doesn't look like a valid Figma link. Paste a figma.com/design/… or figma.com/file/… URL."
            : data.error === "no_token"
            ? "Figma API isn't configured yet. Fill in your visual language manually for now."
            : "Something went wrong. Try again or skip to manual entry.";
        setErrorMsg(msg);
        setStep("error");
        return;
      }

      onComplete(data.fields ?? {}, data.domain ?? "");
    } catch {
      setErrorMsg("Something went wrong. Check your connection and try again.");
      setStep("error");
    }
  };

  const valid = isValidFigmaURL(url);

  /* ── URL input ───────────────────────────────────────── */
  if (step === "url-input") {
    return (
      <div style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="figma-url"
            style={{
              display: "block",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--uxmd-text-muted)",
              marginBottom: "8px",
            }}
          >
            Figma File URL
          </label>
          <input
            id="figma-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.figma.com/design/…"
            style={inputStyle}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow = "0 0 0 2px rgba(247,37,133,0.4)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && valid) handleAnalyze();
            }}
            autoComplete="url"
          />
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              color: "var(--uxmd-text-dim)",
              marginTop: "6px",
              lineHeight: 1.5,
            }}
          >
            Paste a public Figma link. We&rsquo;ll extract your colour styles, typography,
            spacing, and component names.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!url.trim()}
            style={{
              background: !url.trim()
                ? "rgba(247,37,133,0.3)"
                : "var(--uxmd-pink)",
              color: !url.trim() ? "rgba(255,255,255,0.4)" : "#ffffff",
              border: "none",
              boxShadow: "none",
              padding: "9px 24px",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-bebas)",
              fontSize: "18px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: !url.trim() ? "not-allowed" : "pointer",
              transition: "filter 150ms ease",
            }}
            onMouseEnter={(e) => {
              if (url.trim()) e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            Import from Figma
          </button>
          <button
            type="button"
            onClick={onSkipToManual}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
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
            Skip to manual →
          </button>
        </div>
      </div>
    );
  }

  /* ── loading ─────────────────────────────────────────── */
  if (step === "loading") {
    return (
      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            background: "var(--uxmd-surface)",
            border: "0.5px solid var(--uxmd-border)",
            borderRadius: "10px",
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--uxmd-pink)",
                animation: "generatingPulse 1.2s ease infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "16px",
                color: "var(--uxmd-text-muted)",
                transition: "opacity 400ms ease",
              }}
            >
              {LOADING_MESSAGES[loadingMsgIndex]}
            </span>
          </div>

          <div
            style={{
              width: "200px",
              height: "2px",
              background: "var(--uxmd-border)",
              borderRadius: "1px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(to right, var(--uxmd-pink), var(--uxmd-purple))",
                borderRadius: "1px",
                width: `${((loadingMsgIndex + 1) / LOADING_MESSAGES.length) * 100}%`,
                transition: "width 400ms ease",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ── error ───────────────────────────────────────────── */
  return (
    <div style={{ marginTop: "20px" }}>
      <div
        style={{
          borderLeft: "2px solid var(--uxmd-pink)",
          background: "rgba(247,37,133,0.06)",
          borderRadius: "0 4px 4px 0",
          padding: "10px 14px",
          marginBottom: "20px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "15px",
            color: "var(--uxmd-text-muted)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {errorMsg}
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            setStep("url-input");
            setErrorMsg("");
          }}
          style={{
            background: "var(--uxmd-pink)",
            color: "#ffffff",
            border: "none",
            boxShadow: "none",
            padding: "9px 24px",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-bebas)",
            fontSize: "18px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "filter 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          Try Again
        </button>
        <button
          type="button"
          onClick={onSkipToManual}
          style={{
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
          Skip to Manual
        </button>
      </div>
    </div>
  );
}
