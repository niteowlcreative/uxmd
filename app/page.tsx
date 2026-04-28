"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Tab } from "@/app/types";
import { createClient } from "@/lib/supabase/client";
import TabNav from "@/app/components/TabNav";
import BuildTab from "@/app/components/BuildTab";
import PromptsTab from "@/app/components/PromptsTab";
import LearnTab from "@/app/components/LearnTab";
import UserMenu from "@/app/components/UserMenu";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("build");
  const [user, setUser] = useState<User | null>(null);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Get the current user on mount
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    // Keep auth state in sync across tab focus / sign-in from other tabs
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Auth indicator shown flush-right in the tab nav row.
  // When logged in, a Dashboard link sits left of the UserMenu, styled to
  // match the inactive tab appearance.
  const authSlot = user ? (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <Link
        href="/dashboard"
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "17px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--uxmd-text-muted)",
          textDecoration: "none",
          paddingBottom: "14px",
          paddingTop: "16px",
          borderBottom: "2px solid transparent",
          display: "inline-block",
          transition: "color 150ms ease, border-color 150ms ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color =
            "var(--uxmd-text)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.color =
            "var(--uxmd-text-muted)";
        }}
      >
        Dashboard
      </Link>
      <UserMenu user={user} />
    </div>
  ) : (
    <Link
      href="/login"
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "transparent",
        color: "var(--uxmd-text-muted)",
        border: "0.5px solid var(--uxmd-border-strong)",
        padding: "6px 14px",
        borderRadius: "0.5rem",
        fontFamily: "var(--font-bebas)",
        fontSize: "14px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background =
          "var(--uxmd-surface-2)";
        (e.currentTarget as HTMLAnchorElement).style.color = "var(--uxmd-text)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
        (e.currentTarget as HTMLAnchorElement).style.color =
          "var(--uxmd-text-muted)";
      }}
    >
      Sign In
    </Link>
  );

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
          <div
            style={{
              paddingTop: "24px",
              paddingBottom: "16px",
            }}
          >
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
                fontSize: "14px",
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
              background: "linear-gradient(to right, #F72585, #9B5DE5)",
              borderRadius: "1px",
              marginBottom: "0",
            }}
          />

          {/* Tab navigation with auth indicator flush right */}
          <TabNav
            activeTab={activeTab}
            onChange={setActiveTab}
            rightSlot={authSlot}
          />
        </div>
      </header>

      {/* Tab content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeTab === "build" && <BuildTab user={user} />}
        {activeTab === "prompts" && <PromptsTab />}
        {activeTab === "learn" && <LearnTab />}
      </main>
    </div>
  );
}
