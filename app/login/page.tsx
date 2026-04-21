"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      setError("Something went wrong. Check the email address and try again.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--uxmd-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          background: "var(--uxmd-surface)",
          border: "0.5px solid var(--uxmd-border)",
          borderRadius: "10px",
          padding: "40px",
          width: "100%",
          maxWidth: "440px",
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

        {!submitted ? (
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

            <form onSubmit={handleSubmit}>
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
                  required
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
                  onBlur={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
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
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading
                    ? "rgba(247,37,133,0.5)"
                    : "var(--uxmd-pink)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "none",
                  padding: "10px 20px",
                  borderRadius: "0.5rem",
                  fontFamily: "var(--font-bebas)",
                  fontSize: "16px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "filter 150ms ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading)
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
                style={{
                  color: "var(--uxmd-purple)",
                  textDecoration: "none",
                }}
              >
                Continue without an account
              </Link>
            </p>
          </>
        ) : (
          /* ── Success state ── */
          <>
            {/* Checkmark icon */}
            <div
              style={{ textAlign: "center", marginBottom: "16px" }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <circle
                  cx="16"
                  cy="16"
                  r="14.75"
                  stroke="#F72585"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 16.5L14.5 21L22 12"
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

            {/* Send Again — ghost button, resets to form */}
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              style={{
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
              Send Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
