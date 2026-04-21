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
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError("Couldn't send the magic link. Check the email address and try again.");
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
          maxWidth: "420px",
        }}
      >
        {/* Wordmark */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            aria-label="UXMD"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "32px",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              lineHeight: 1,
              userSelect: "none",
              marginBottom: "2px",
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
              width: "72px",
              background: "linear-gradient(to right, var(--uxmd-pink), var(--uxmd-purple))",
              borderRadius: "1px",
            }}
          />
        </div>

        {!submitted ? (
          <>
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
              Sign in or create an account
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
                color: "var(--uxmd-text-muted)",
                marginBottom: "24px",
                lineHeight: 1.5,
              }}
            >
              Enter your email and we&rsquo;ll send you a magic link. No
              password needed.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "16px" }}>
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
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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

              {error && (
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "13px",
                    color: "var(--uxmd-pink)",
                    marginBottom: "12px",
                    lineHeight: 1.4,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? "rgba(247,37,133,0.5)" : "var(--uxmd-pink)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "none",
                  padding: "9px 20px",
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
                {loading ? "Sending…" : "Send magic link"}
              </button>
            </form>

            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
                color: "var(--uxmd-text-muted)",
                marginTop: "20px",
                textAlign: "center",
              }}
            >
              Just browsing?{" "}
              <Link
                href="/"
                style={{
                  color: "var(--uxmd-text-muted)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Continue without an account
              </Link>
            </p>
          </>
        ) : (
          /* Success state */
          <>
            <h2
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "28px",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: "var(--uxmd-text)",
                marginBottom: "12px",
                lineHeight: 1.1,
              }}
            >
              Check your email
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                color: "var(--uxmd-text-muted)",
                lineHeight: 1.6,
                marginBottom: "24px",
              }}
            >
              We sent a magic link to{" "}
              <span style={{ color: "var(--uxmd-text)" }}>{email}</span>.
              Click it to sign in — it expires in 10 minutes.
            </p>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "13px",
                color: "var(--uxmd-text-muted)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              ← Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
