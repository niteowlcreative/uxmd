"use client";

export default function BuildTab() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8 py-24">
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

        <button
          style={{
            background: "var(--uxmd-pink)",
            color: "#ffffff",
            border: "none",
            padding: "9px 20px",
            borderRadius: "6px",
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
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
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
        </p>
      </div>
    </div>
  );
}
