"use client";

interface ButtonGroupProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export default function ButtonGroup({ options, value, onChange }: ButtonGroupProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(isSelected ? "" : opt)}
            style={{
              background: isSelected ? "var(--uxmd-purple-muted)" : "transparent",
              color: isSelected ? "var(--uxmd-purple)" : "var(--uxmd-text-muted)",
              border: isSelected
                ? "0.5px solid var(--uxmd-purple)"
                : "0.5px solid var(--uxmd-border-strong)",
              borderRadius: "6px",
              padding: "6px 14px",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              cursor: "pointer",
              transition: "all 150ms ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = "var(--uxmd-surface-2)";
                e.currentTarget.style.color = "var(--uxmd-text)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--uxmd-text-muted)";
              }
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
