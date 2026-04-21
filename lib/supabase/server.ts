import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Must be called inside a Server Component or Route Handler.
// cookies() is async in Next.js 16 — always await this function.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component (read-only).
            // Ignored — proxy.ts handles session refresh.
          }
        },
      },
    }
  );
}
