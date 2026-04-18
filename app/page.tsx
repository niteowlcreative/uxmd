"use client";

import { useState } from "react";
import type { Tab } from "@/app/types";
import TabNav from "@/app/components/TabNav";
import BuildTab from "@/app/components/BuildTab";
import PromptsTab from "@/app/components/PromptsTab";
import LearnTab from "@/app/components/LearnTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("build");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--uxmd-bg)",
      }}
    >
      {/* Site header */}
      <header style={{ padding: "0 32px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* Wordmark row */}
          <div style={{ paddingTop: "24px", paddingBottom: "16px" }}>
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
            {/* Decorative accent bar — pink → purple, spec: 2px only under wordmark */}
            <div
              aria-hidden
              style={{
                height: "2px",
                width: "72px",
                background:
                  "linear-gradient(to right, var(--uxmd-pink), var(--uxmd-purple))",
                borderRadius: "1px",
                marginBottom: "6px",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--uxmd-text-muted)",
              }}
            >
              Using AI to build context for AI - a UX designer tool
            </p>
          </div>

          {/* Full-width accent bar between tagline and tab nav */}
          <div
            aria-hidden
            style={{
              height: "2px",
              width: "100%",
              background:
                "linear-gradient(to right, #F72585, #9B5DE5)",
              borderRadius: "1px",
              marginBottom: "0",
            }}
          />

          {/* Tab navigation */}
          <TabNav activeTab={activeTab} onChange={setActiveTab} />
        </div>
      </header>

      {/* Tab content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeTab === "build" && <BuildTab />}
        {activeTab === "prompts" && <PromptsTab />}
        {activeTab === "learn" && <LearnTab />}
      </main>
    </div>
  );
}
