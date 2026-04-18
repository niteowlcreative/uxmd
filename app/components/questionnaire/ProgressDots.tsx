"use client";

interface ProgressDotsProps {
  currentStep: number;
  totalSteps?: number;
}

export default function ProgressDots({
  currentStep,
  totalSteps = 7,
}: ProgressDotsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        marginBottom: "24px",
      }}
    >
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isDone = step < currentStep;
        const isActive = step === currentStep;
        const isPending = step > currentStep;

        return (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            {/* Dot */}
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDone
                  ? "var(--uxmd-purple)"
                  : isActive
                  ? "var(--uxmd-pink)"
                  : "var(--uxmd-surface-2)",
                border: isPending
                  ? "0.5px solid var(--uxmd-border-strong)"
                  : "none",
                transition: "background 150ms ease",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "12px",
                  letterSpacing: "0.02em",
                  color: isPending ? "var(--uxmd-text-dim)" : "#ffffff",
                  lineHeight: 1,
                }}
              >
                {step}
              </span>
            </div>

            {/* Connector */}
            {step < totalSteps && (
              <div
                style={{
                  width: "24px",
                  height: "0.5px",
                  background: "rgba(255,255,255,0.15)",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
