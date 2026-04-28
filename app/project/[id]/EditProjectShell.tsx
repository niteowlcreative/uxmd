"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { FormData } from "@/app/components/questionnaire/types";
import Questionnaire from "@/app/components/questionnaire/Questionnaire";

interface EditProjectShellProps {
  user: User;
  projectId: string;
  projectName: string;
  initialData: Partial<FormData>;
}

export default function EditProjectShell({
  user,
  projectId,
  projectName,
  initialData,
}: EditProjectShellProps) {
  const router = useRouter();

  return (
    <div>
      {/* "EDITING: [PROJECT NAME]" label */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 32px 0",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "16px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--uxmd-text-muted)",
          }}
        >
          Editing: {projectName}
        </p>
      </div>

      <Questionnaire
        onReset={() => router.push("/dashboard")}
        isLoggedIn={true}
        userId={user.id}
        projectId={projectId}
        initialData={initialData}
        editProjectName={projectName}
      />
    </div>
  );
}
