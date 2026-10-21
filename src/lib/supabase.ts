import { createBrowserClient } from "@supabase/ssr";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Browser-side client. The session lives in a cookie so the server can read
 * the same session back on the next request.
 */
export const createBrowserSupabaseClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side client bound to the request cookies. Used by pages, route
 * handlers, and middleware to read the caller's session. It never uses the
 * service role key, so RLS still applies to anything it touches.
 */
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
};

/**
 * A client that acts as the signed-in user rather than as a service role.
 *
 * Every request carries the caller's own access token, so Row Level Security
 * decides what it may touch. The admin policies in
 * `supabase/migrations/` are what grant write access to the CMS identity —
 * with them in place the service-role key is not needed anywhere.
 */
export const createUserScopedClient = async (accessToken: string): Promise<SupabaseClient> =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

/**
 * Service-role client. This bypasses RLS entirely, so it is only for
 * administrative chores that no user-scoped policy covers. The CMS itself does
 * not depend on it.
 */
export const createServiceClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
