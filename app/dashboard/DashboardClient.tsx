"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface Project {
  id: string;
  project_name: string;
  design_md: string;
  answers: Record<string, unknown> | null;
  created_at: string;
  expires_at: string;
}

interface DashboardClientProps {
  user: User;
  initialProjects: Project[];
}

function daysUntil(isoDate: string): number {
  return Math.floor(
    (new Date(isoDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const ghostBtnStyle: React.CSSProperties = {
  background: "transparent",
  color: "var(--uxmd-text-muted)",
  border: "0.5px solid var(--uxmd-border-strong)",
  padding: "5px 14px",
  borderRadius: "0.5rem",
  fontFamily: "var(--font-bebas)",
  fontSize: "14px",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 150ms ease",
  whiteSpace: "nowrap" as const,
};

export default function DashboardClient({
  user,
  initialProjects,
}: DashboardClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const supabase = createClient();

  const handleDownload = (project: Project) => {
    const blob = new Blob([project.design_md], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DESIGN.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDuplicate = async (project: Project) => {
    setLoadingId(project.id);
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        project_name: `${project.project_name} (copy)`,
        design_md: project.design_md,
        answers: project.answers,
      })
      .select()
      .single();

    setLoadingId(null);

    if (!error && data) {
      setProjects((prev) => [data as Project, ...prev]);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setLoadingId(id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setLoadingId(null);
    setDeleteConfirmId(null);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 32px 64px",
      }}
    >
      {/* Page heading */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "36px",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: "var(--uxmd-text)",
              marginBottom: "4px",
            }}
          >
            My Projects
          </h2>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "13px",
              color: "var(--uxmd-text-muted)",
            }}
          >
            {user.email}
          </p>
        </div>
        <Link
          href="/"
          style={{
            background: "var(--uxmd-pink)",
            color: "#ffffff",
            border: "none",
            padding: "9px 20px",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-bebas)",
            fontSize: "16px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-block",
            transition: "filter 150ms ease",
          }}
        >
          Start a New Project
        </Link>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 32px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "28px",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: "var(--uxmd-text)",
              marginBottom: "8px",
            }}
          >
            No saved projects yet
          </h3>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              color: "var(--uxmd-text-muted)",
              marginBottom: "24px",
            }}
          >
            Projects you save will appear here. They&rsquo;re kept for 90 days.
          </p>
          <Link
            href="/"
            style={{
              background: "var(--uxmd-pink)",
              color: "#ffffff",
              border: "none",
              padding: "9px 20px",
              borderRadius: "0.5rem",
              fontFamily: "var(--font-bebas)",
              fontSize: "16px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Start a New Project
          </Link>
        </div>
      ) : (
        <>
          {/* Project grid */}
          <div className="dashboard-grid">
            {projects.map((project) => {
              const days = daysUntil(project.expires_at);
              const isExpiringSoon = days <= 14;
              const isConfirmingDelete = deleteConfirmId === project.id;
              const isLoading = loadingId === project.id;

              return (
                <div
                  key={project.id}
                  style={{
                    background: "var(--uxmd-surface)",
                    border: isExpiringSoon
                      ? `0.5px solid var(--uxmd-pink)`
                      : "0.5px solid var(--uxmd-border)",
                    borderLeft: isExpiringSoon
                      ? "2px solid var(--uxmd-pink)"
                      : undefined,
                    borderRadius: "10px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Card body */}
                  <div style={{ padding: "16px 20px", flex: 1 }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-bebas)",
                        fontSize: "20px",
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        color: "var(--uxmd-text)",
                        marginBottom: "4px",
                        lineHeight: 1.2,
                      }}
                    >
                      {project.project_name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "11px",
                        color: "var(--uxmd-text-dim)",
                        marginBottom: "8px",
                      }}
                    >
                      Created {formatDate(project.created_at)}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "11px",
                        color: isExpiringSoon
                          ? "var(--uxmd-pink)"
                          : "var(--uxmd-text-dim)",
                      }}
                    >
                      {days > 0
                        ? `Expires in ${days} day${days === 1 ? "" : "s"}`
                        : "Expiring soon"}
                    </p>
                  </div>

                  {/* Card actions */}
                  <div
                    style={{
                      borderTop: "0.5px solid var(--uxmd-border)",
                      padding: "12px 20px",
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {isConfirmingDelete ? (
                      /* Delete confirmation */
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                          width: "100%",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "12px",
                            color: "var(--uxmd-text-muted)",
                            flex: 1,
                          }}
                        >
                          Are you sure? This cannot be undone.
                        </span>
                        <button
                          onClick={() => handleDeleteConfirm(project.id)}
                          disabled={isLoading}
                          style={{
                            ...ghostBtnStyle,
                            color: "var(--uxmd-pink)",
                            borderColor: "var(--uxmd-pink)",
                          }}
                        >
                          {isLoading ? "Deleting…" : "Confirm"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          style={ghostBtnStyle}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDownload(project)}
                          style={ghostBtnStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "var(--uxmd-surface-2)";
                            e.currentTarget.style.color = "var(--uxmd-text)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color =
                              "var(--uxmd-text-muted)";
                          }}
                        >
                          Download
                        </button>
                        <Link
                          href={`/project/${project.id}`}
                          style={{
                            ...ghostBtnStyle,
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDuplicate(project)}
                          disabled={isLoading}
                          style={{
                            ...ghostBtnStyle,
                            opacity: isLoading ? 0.5 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.background =
                                "var(--uxmd-surface-2)";
                              e.currentTarget.style.color = "var(--uxmd-text)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color =
                              "var(--uxmd-text-muted)";
                          }}
                        >
                          {isLoading ? "…" : "Duplicate"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          style={{ ...ghostBtnStyle, marginLeft: "auto" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--uxmd-pink)";
                            e.currentTarget.style.borderColor =
                              "var(--uxmd-pink)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color =
                              "var(--uxmd-text-muted)";
                            e.currentTarget.style.borderColor =
                              "var(--uxmd-border-strong)";
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Persistent notice */}
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              color: "var(--uxmd-text-dim)",
              textAlign: "center",
              marginTop: "40px",
            }}
          >
            Projects are automatically deleted 90 days after creation.
            Duplicate a project to reset its expiry.
          </p>
        </>
      )}
    </div>
  );
}
