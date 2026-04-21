import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import TabNav from "@/app/components/TabNav";
import UserMenu from "@/app/components/UserMenu";

export const metadata = {
  title: "My Projects — UXMD",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_name, design_md, answers, created_at, expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--uxmd-bg)",
      }}
    >
      {/* Header — mirrors the home page header exactly */}
      <header style={{ padding: "0 32px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              paddingTop: "24px",
              paddingBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            {/* Wordmark */}
            <div>
              <Link href="/" style={{ textDecoration: "none" }}>
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
              </Link>
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

            {/* User menu */}
            <UserMenu user={user} />
          </div>

          {/* Full-width accent bar */}
          <div
            aria-hidden
            style={{
              height: "2px",
              width: "100%",
              background: "linear-gradient(to right, #F72585, #9B5DE5)",
              borderRadius: "1px",
            }}
          />

          {/* Tab links — navigate back to home */}
          <nav
            style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}
            className="flex gap-8 px-0"
          >
            {(["Build", "Prompts", "Learn"] as const).map((label) => (
              <Link
                key={label}
                href="/"
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "15px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--uxmd-text-muted)",
                  paddingBottom: "14px",
                  paddingTop: "16px",
                  borderBottom: "2px solid transparent",
                  textDecoration: "none",
                  transition: "color 150ms ease",
                  display: "inline-block",
                  marginRight: "32px",
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <DashboardClient user={user} initialProjects={projects ?? []} />
      </main>
    </div>
  );
}
