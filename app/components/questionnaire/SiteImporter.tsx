"use client";

import { useState, useEffect, useRef } from "react";
import type { FormData } from "./types";

/* ─── types ────────────────────────────────────────────── */

type ImportStep = "url-input" | "loading" | "error";

interface SiteImporterProps {
  onComplete: (fields: Partial<FormData>, domain: string) => void;
  onSkipToManual: () => void;
}

/* ─── loading messages ─────────────────────────────────── */

const LOADING_MESSAGES = [
  "Fetching your site...",
  "Reading stylesheets...",
  "Identifying colour palette...",
  "Analyzing typography...",
  "Mapping component patterns...",
  "Almost there...",
];

/* ─── input style (matches the rest of the questionnaire) */

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

/* ─── component ────────────────────────────────────────── */

export default function SiteImporter({ onComplete, onSkipToManual }: SiteImporterProps) {
  const [step, setStep] = useState<ImportStep>("url-input");
  const [url, setUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cycle loading messages while in loading state
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

  const isValidURL = (v: string) => /^https?:\/\/.+/i.test(v.trim());

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    // auto-prepend https:// if missing
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    setStep("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/extract-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: withProtocol }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const msg =
          data.error === "fetch_failed"
            ? "Couldn't reach that site. Check the URL and make sure it's publicly accessible."
            : data.error === "claude_failed"
            ? "Analysis failed. You can fill in the fields manually instead."
            : data.error === "invalid_url"
            ? "That doesn't look like a valid URL. Try including https://"
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

  /* ── URL input ───────────────────────────────────────── */
  if (step === "url-input") {
    const valid = isValidURL(url) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(url.trim());

    return (
      <div style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="site-url"
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
            Website URL
          </label>
          <input
            id="site-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yoursite.com"
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
            We'll analyze your homepage and extract colours, typography, spacing,
            and component patterns.
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
            Analyze Site
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
          {/* Pulse dot + message */}
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

          {/* Progress bar */}
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
