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
        paddingTop: "4px",
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
          background: "none",
          border: "none",
          fontFamily: "var(--font-dm-sans)",
          fontSize: "12px",
          color: "var(--uxmd-text-dim)",
          cursor: "pointer",
          padding: "0",
          textDecoration: "underline",
          textUnderlineOffset: "3px",
          transition: "color 150ms ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "var(--uxmd-text-muted)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--uxmd-text-dim)")
        }
      >
        Sign out
      </button>
    </div>
  );
}
