"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { createClient } from "@/lib/supabase/client";

/* ─── helpers ─────────────────────────────────────────── */

function isValidEmail(v: string) {
  // must have @ with at least one char before it and a dot-separated domain after
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/* ─── shared button style tokens ──────────────────────── */

const GHOST_BTN: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  color: "var(--uxmd-text-muted)",
  border: "0.5px solid var(--uxmd-border-strong)",
  padding: "10px 20px",
  borderRadius: "0.5rem",
  fontFamily: "var(--font-bebas)",
  fontSize: "16px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 150ms ease",
};

/* ─── sub-components (stable refs, no re-mount issues) ── */

function FormContent({
  email,
  setEmail,
  error,
  loading,
  onSubmit,
  submitBtnRef,
}: {
  email: string;
  setEmail: (v: string) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  submitBtnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const valid = isValidEmail(email);
  const disabled = !valid || loading;

  return (
    <>
      {/* Heading */}
      <h2
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "28px",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--uxmd-text)",
          marginBottom: "10px",
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        Sign in or create an account
      </h2>

      {/* Subtext */}
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "13px",
          color: "var(--uxmd-text-muted)",
          marginBottom: "24px",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        Enter your email and we&rsquo;ll send you a magic link.
        <br />
        No password needed.
      </p>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: error ? "8px" : "16px" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "11px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--uxmd-text-muted)",
              marginBottom: "8px",
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            autoComplete="email"
            style={{
              width: "100%",
              background: "var(--uxmd-surface-2)",
              border: "0.5px solid var(--uxmd-border-strong)",
              borderRadius: "6px",
              padding: "10px 14px",
              color: "var(--uxmd-text)",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 0 0 2px rgba(247,37,133,0.4)")
            }
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>

        {/* Inline error */}
        {error && (
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              color: "var(--uxmd-pink)",
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          ref={submitBtnRef}
          type="submit"
          disabled={disabled}
          style={{
            width: "100%",
            background: disabled
              ? "rgba(247,37,133,0.3)"
              : "var(--uxmd-pink)",
            color: disabled ? "rgba(255,255,255,0.4)" : "#ffffff",
            border: "none",
            boxShadow: "none",
            padding: "10px 20px",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-bebas)",
            fontSize: "16px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "background 150ms ease, color 150ms ease",
          }}
          onMouseEnter={(e) => {
            if (!disabled)
              e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseLeave={(e) =>
            (e.currentTarget.style.filter = "brightness(1)")
          }
        >
          {loading ? "Sending…" : "Send Magic Link"}
        </button>
      </form>

      {/* Divider */}
      <div
        aria-hidden
        style={{
          height: "0.5px",
          background: "rgba(255,255,255,0.08)",
          margin: "24px 0",
        }}
      />

      {/* Guest link */}
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "13px",
          color: "var(--uxmd-text-muted)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Just browsing?{" "}
        <Link
          href="/"
          style={{ color: "var(--uxmd-purple)", textDecoration: "none" }}
        >
          Continue without an account
        </Link>
      </p>
    </>
  );
}

function SuccessContent({
  email,
  onSendAgain,
}: {
  email: string;
  onSendAgain: () => void;
}) {
  return (
    <>
      {/* Checkmark icon — 48px, stroke only */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <circle cx="24" cy="24" r="22" stroke="#F72585" strokeWidth="2" />
          <path
            d="M15 24.5L21 30.5L33 18"
            stroke="#F72585"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <h2
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "24px",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--uxmd-text)",
          marginBottom: "10px",
          lineHeight: 1.1,
          textAlign: "center",
        }}
      >
        Check your email
      </h2>

      {/* Body */}
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "13px",
          color: "var(--uxmd-text-muted)",
          lineHeight: 1.6,
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        We sent a magic link to{" "}
        <span style={{ color: "var(--uxmd-text)" }}>{email}</span>.
        <br />
        Click it to sign in — it expires in 10 minutes.
      </p>

      {/* Send Again ghost button */}
      <button
        type="button"
        onClick={onSendAgain}
        style={GHOST_BTN}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--uxmd-surface-2)";
          e.currentTarget.style.color = "var(--uxmd-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--uxmd-text-muted)";
        }}
      >
        Send Again
      </button>
    </>
  );
}

/* ─── main page ───────────────────────────────────────── */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refs for GSAP targets
  const cardRef = useRef<HTMLDivElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  /* ── flip forward: form → success ── */
  const flipToSuccess = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    const tl = gsap.timeline();

    // Step 1 — Button squeeze (0ms)
    if (submitBtnRef.current) {
      tl.to(submitBtnRef.current, {
        scaleY: 0.96,
        duration: 0.08,
        ease: "power1.in",
      }).to(submitBtnRef.current, {
        scaleY: 1,
        duration: 0.08,
        ease: "power1.out",
      });
    }

    // Step 2 — Card compress (100ms delay from start)
    tl.to(
      card,
      {
        scaleY: 0.97,
        opacity: 0.85,
        duration: 0.12,
        ease: "power1.inOut",
      },
      0.1
    );

    // Step 3 — Spin to 90deg (200ms delay) — content swap happens at midpoint
    tl.to(
      card,
      {
        rotationY: 90,
        duration: 0.25,
        ease: "cubic-bezier(0.4, 0, 1, 1)",
        onComplete() {
          // card is invisible at 90deg — swap content
          setSubmitted(true);
        },
      },
      0.2
    );

    // Step 4 — Reveal from 90deg → 0deg (450ms from start)
    tl.to(
      card,
      {
        rotationY: 0,
        scaleY: 1,
        opacity: 1,
        duration: 0.3,
        ease: "cubic-bezier(0, 0, 0.2, 1)",
      },
      0.45
    )
      // Subtle overshoot settle
      .to(card, {
        rotationY: -3,
        duration: 0.08,
        ease: "power1.out",
      })
      .to(card, {
        rotationY: 0,
        duration: 0.07,
        ease: "power1.inOut",
      });

    // Step 5 — Stagger success children (750ms from start)
    tl.fromTo(
      "#success-content > *",
      { y: 12, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.08,
      },
      0.75
    );
  }, []);

  /* ── flip back: success → form ── */
  const flipToForm = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    const tl = gsap.timeline();

    // Rotate to -90deg
    tl.to(card, {
      rotationY: -90,
      duration: 0.25,
      ease: "cubic-bezier(0.4, 0, 1, 1)",
      onComplete() {
        setSubmitted(false);
        setEmail("");
        setError("");
      },
    });

    // Rotate back to 0
    tl.to(card, {
      rotationY: 0,
      duration: 0.3,
      ease: "cubic-bezier(0, 0, 0.2, 1)",
    })
      .to(card, { rotationY: 3, duration: 0.08, ease: "power1.out" })
      .to(card, { rotationY: 0, duration: 0.07, ease: "power1.inOut" });
  }, []);

  /* ── form submit ── */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidEmail(email) || loading) return;

      setLoading(true);
      setError("");

      // Fire Supabase request immediately — don't await before animating
      const supabase = createClient();
      const authPromise = supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      // Animation runs in parallel
      flipToSuccess();

      // Handle auth result after animation has had time to run
      const { error: authError } = await authPromise;
      setLoading(false);

      if (authError) {
        // If already flipped to success, flip back and show error
        if (submitted) {
          flipToForm();
        }
        setError("Something went wrong. Check the email address and try again.");
      }
    },
    [email, loading, flipToSuccess, flipToForm, submitted]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--uxmd-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        // perspective needed for rotateY on child
        perspective: "800px",
      }}
    >
      {/* Card — GSAP target */}
      <div
        ref={cardRef}
        style={{
          background: "var(--uxmd-surface)",
          border: "0.5px solid var(--uxmd-border)",
          borderRadius: "10px",
          padding: "40px",
          width: "100%",
          maxWidth: "440px",
          // transform-style needed for 3-D children
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
      >
        {/* Wordmark — centred */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1
            aria-label="UXMD"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "36px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1,
              userSelect: "none",
              marginBottom: "6px",
              display: "inline-block",
            }}
          >
            <span style={{ color: "var(--uxmd-text)" }}>UX</span>
            <span style={{ color: "var(--uxmd-pink)" }}>M</span>
            <span style={{ color: "var(--uxmd-purple)" }}>D</span>
          </h1>
          <div
            aria-hidden
            style={{
              height: "2px",
              width: "56px",
              background:
                "linear-gradient(to right, var(--uxmd-pink), var(--uxmd-purple))",
              borderRadius: "1px",
              margin: "0 auto",
            }}
          />
        </div>

        {/* Content area — swapped by GSAP at the 90-deg midpoint */}
        {!submitted ? (
          <FormContent
            email={email}
            setEmail={setEmail}
            error={error}
            loading={loading}
            onSubmit={handleSubmit}
            submitBtnRef={submitBtnRef}
          />
        ) : (
          <div id="success-content">
            <SuccessContent
              email={email}
              onSendAgain={flipToForm}
            />
          </div>
        )}
      </div>
    </div>
  );
}
