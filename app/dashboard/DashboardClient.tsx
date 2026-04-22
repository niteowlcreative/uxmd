"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

/* ─── helpers ─────────────────────────────────────────── */

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

function getDescription(answers: Record<string, unknown> | null): string {
  if (!answers) return "";
  const v = answers.whatItDoes;
  return typeof v === "string" ? v : "";
}

/* ─── shared micro-button style ───────────────────────── */

const actionBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "13px",
  color: "var(--uxmd-text-muted)",
  cursor: "pointer",
  padding: "2px 0",
  transition: "color 150ms ease",
  whiteSpace: "nowrap",
};

/* ─── column header style ─────────────────────────────── */

const thStyle: React.CSSProperties = {
  fontFamily: "var(--font-dm-sans)",
  fontSize: "11px",
  fontWeight: 400,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "rgba(240,238,232,0.35)",
  padding: "0 16px 12px 0",
  borderBottom: "0.5px solid rgba(255,255,255,0.08)",
  textAlign: "left",
};

/* ─── cell style ──────────────────────────────────────── */

const tdStyle: React.CSSProperties = {
  padding: "16px 16px 16px 0",
  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "14px",
  verticalAlign: "middle",
};

/* ─── component ───────────────────────────────────────── */

export default function DashboardClient({
  user,
  initialProjects,
}: DashboardClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const supabase = createClient();

  // Close open menu on any outside click
  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuId]);

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

  const hasProjects = projects.length > 0;

  const newProjectLink = (
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
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.filter =
          "brightness(1.1)")
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLAnchorElement).style.filter = "brightness(1)")
      }
    >
      Start a New Project
    </Link>
  );

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 32px 64px",
      }}
    >
      {/* Heading + CTA row — only shown when projects exist */}
      {hasProjects && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "36px",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              color: "var(--uxmd-text)",
              margin: 0,
            }}
          >
            My Projects
          </h2>
          {newProjectLink}
        </div>
      )}

      {/* Empty state — only shown when no projects; heading is hidden */}
      {!hasProjects ? (
        <div style={{ textAlign: "center", padding: "80px 32px" }}>
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
          {newProjectLink}
        </div>
      ) : (
        <>
          {/* Project table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "22%" }}>Project Name</th>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, width: "120px" }}>Created</th>
                <th style={{ ...thStyle, width: "110px" }}>Expires</th>
                {/* Actions column — no header label */}
                <th style={{ ...thStyle, width: "40px", padding: "0 0 12px 0" }} />
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => {
                const days = daysUntil(project.expires_at);
                const isExpiringSoon = days <= 14;
                const isConfirmingDelete = deleteConfirmId === project.id;
                const isMenuOpen = openMenuId === project.id;
                const isLoading = loadingId === project.id;

                const raw = getDescription(project.answers);
                const displayDesc =
                  raw.length > 80 ? raw.slice(0, 80) + "…" : raw;

                const expiresLabel =
                  days > 0
                    ? `in ${days} day${days === 1 ? "" : "s"}`
                    : "expiring soon";

                /* Delete confirmation — full-width colspan row */
                if (isConfirmingDelete) {
                  return (
                    <tr key={project.id}>
                      <td
                        colSpan={5}
                        style={{
                          ...tdStyle,
                          padding: "14px 0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-dm-sans)",
                              fontSize: "13px",
                              color: "var(--uxmd-text-muted)",
                            }}
                          >
                            Delete &ldquo;{project.project_name}&rdquo;? This
                            cannot be undone.
                          </span>
                          <button
                            onClick={() => handleDeleteConfirm(project.id)}
                            disabled={isLoading}
                            style={{
                              ...actionBtnStyle,
                              color: "var(--uxmd-pink)",
                              fontWeight: 500,
                            }}
                          >
                            {isLoading ? "Deleting…" : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            style={actionBtnStyle}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "var(--uxmd-text)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--uxmd-text-muted)")
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={project.id}>
                    {/* PROJECT NAME */}
                    <td style={tdStyle}>
                      <Link
                        href={`/project/${project.id}`}
                        style={{
                          fontFamily: "var(--font-bebas)",
                          fontSize: "16px",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          color: "var(--uxmd-text)",
                          textDecoration: "none",
                          transition: "color 150ms ease",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLAnchorElement).style.color =
                            "#F72585")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLAnchorElement).style.color =
                            "var(--uxmd-text)")
                        }
                      >
                        {project.project_name}
                      </Link>
                    </td>

                    {/* DESCRIPTION */}
                    <td style={{ ...tdStyle, paddingRight: "24px" }}>
                      {displayDesc ? (
                        <span
                          style={{
                            fontSize: "13px",
                            color: "rgba(240,238,232,0.45)",
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {displayDesc}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "13px",
                            color: "rgba(240,238,232,0.25)",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>

                    {/* CREATED */}
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: "13px",
                        color: "rgba(240,238,232,0.45)",
                      }}
                    >
                      {formatDate(project.created_at)}
                    </td>

                    {/* EXPIRES */}
                    <td
                      style={{
                        ...tdStyle,
                        fontSize: "13px",
                        color: isExpiringSoon
                          ? "#F72585"
                          : "rgba(240,238,232,0.45)",
                      }}
                    >
                      {expiresLabel}
                    </td>

                    {/* ACTIONS */}
                    <td
                      style={{
                        ...tdStyle,
                        padding: "16px 0",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isMenuOpen ? (
                        /* Inline action buttons */
                        <div
                          style={{
                            display: "flex",
                            gap: "14px",
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                          // Stop propagation so the outside-click handler
                          // doesn't immediately close the menu on open
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            style={actionBtnStyle}
                            onClick={() => {
                              handleDownload(project);
                              setOpenMenuId(null);
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color =
                                "var(--uxmd-text)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--uxmd-text-muted)")
                            }
                          >
                            Download
                          </button>
                          <button
                            style={{
                              ...actionBtnStyle,
                              opacity: isLoading ? 0.5 : 1,
                            }}
                            disabled={isLoading}
                            onClick={() => {
                              handleDuplicate(project);
                              setOpenMenuId(null);
                            }}
                            onMouseEnter={(e) => {
                              if (!isLoading)
                                e.currentTarget.style.color =
                                  "var(--uxmd-text)";
                            }}
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--uxmd-text-muted)")
                            }
                          >
                            {isLoading ? "…" : "Duplicate"}
                          </button>
                          <button
                            style={actionBtnStyle}
                            onClick={() => {
                              setDeleteConfirmId(project.id);
                              setOpenMenuId(null);
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#F72585")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--uxmd-text-muted)")
                            }
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        /* ••• trigger */
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(240,238,232,0.3)",
                            fontSize: "16px",
                            lineHeight: 1,
                            padding: "2px 0",
                            transition: "color 150ms ease",
                            letterSpacing: "0.1em",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              isMenuOpen ? null : project.id
                            );
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color =
                              "var(--uxmd-text-muted)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color =
                              "rgba(240,238,232,0.3)")
                          }
                          aria-label="Project actions"
                        >
                          •••
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Persistent notice */}
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "12px",
              color: "var(--uxmd-text-dim)",
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
