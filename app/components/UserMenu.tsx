"use client";

import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "12px",
          color: "var(--uxmd-text-muted)",
        }}
      >
        {user.email}
      </span>
      <button
        onClick={handleSignOut}
        style={{
          background: "transparent",
          color: "var(--uxmd-text-muted)",
          border: "0.5px solid var(--uxmd-border-strong)",
          padding: "6px 14px",
          borderRadius: "0.5rem",
          fontFamily: "var(--font-bebas)",
          fontSize: "14px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "all 150ms ease",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--uxmd-surface-2)";
          e.currentTarget.style.color = "var(--uxmd-text)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--uxmd-text-muted)";
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
