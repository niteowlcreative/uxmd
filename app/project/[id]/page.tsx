import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditProjectShell from "./EditProjectShell";
import UserMenu from "@/app/components/UserMenu";
import type { FormData } from "@/app/components/questionnaire/types";

// Next.js 16: params is async — must be awaited.
interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, project_name, answers, user_id")
    .eq("id", id)
    .single();

  if (error || !project || project.user_id !== user.id) {
    notFound();
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--uxmd-bg)",
      }}
    >
      {/* Header */}
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
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--uxmd-text-muted)",
                }}
              >
                Using AI to build context for AI - a UX designer tool
              </p>
            </div>
            <UserMenu user={user} />
          </div>

          <div
            aria-hidden
            style={{
              height: "2px",
              width: "100%",
              background: "linear-gradient(to right, #F72585, #9B5DE5)",
              borderRadius: "1px",
            }}
          />

          <div
            style={{
              borderBottom: "0.5px solid rgba(255,255,255,0.08)",
              padding: "14px 0",
            }}
          >
            <Link
              href="/dashboard"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "15px",
                color: "var(--uxmd-text-muted)",
                textDecoration: "none",
                transition: "color 150ms ease",
              }}
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <EditProjectShell
          user={user}
          projectId={project.id}
          projectName={project.project_name}
          initialData={(project.answers as Partial<FormData>) ?? {}}
        />
      </main>
    </div>
  );
}
