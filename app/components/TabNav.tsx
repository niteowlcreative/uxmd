"use client";

import type { Tab } from "@/app/types";

interface TabNavProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  rightSlot?: React.ReactNode;
}

const TABS: { id: Tab; label: string }[] = [
  { id: "build", label: "Build" },
  { id: "prompts", label: "Prompts" },
  { id: "learn", label: "Learn" },
];

export default function TabNav({ activeTab, onChange, rightSlot }: TabNavProps) {
  return (
    <nav
      style={{
        borderBottom: "0.5px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "space-between",
      }}
    >
      <div className="flex gap-8 px-8">
        {TABS.map(({ id, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "17px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: isActive ? "var(--uxmd-pink)" : "var(--uxmd-text-muted)",
                borderBottom: isActive
                  ? "2px solid var(--uxmd-pink)"
                  : "2px solid transparent",
                paddingBottom: "14px",
                paddingTop: "16px",
                background: "none",
                border: "none",
                borderBottomWidth: "2px",
                borderBottomStyle: "solid",
                borderBottomColor: isActive ? "var(--uxmd-pink)" : "transparent",
                cursor: "pointer",
                transition: "color 150ms ease, border-color 150ms ease",
              }}
              aria-selected={isActive}
              role="tab"
            >
              {label}
            </button>
          );
        })}
      </div>

      {rightSlot && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingRight: "0",
          }}
        >
          {rightSlot}
        </div>
      )}
    </nav>
  );
}
