import { createServerSupabaseClient, createUserScopedClient } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuthedUser {
  id: string;
  email: string | null;
  accessToken: string;
}

/**
 * Emails allowed to use the CMS. Read from the environment, never from the
 * database and never from user-editable profile metadata.
 */
export function adminEmails(): string[] {
  return (process.env.CMS_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

export async function getSession() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

/**
 * The signed-in administrator, or null when the caller is anonymous or the
 * account is not on the allowlist.
 *
 * The email comes from the signed access token, so it cannot be changed by
 * the account holder.
 */
export async function getUser(): Promise<AuthedUser | null> {
  const session = await getSession();
  const user = session?.user;
  if (!user) return null;

  const email = user.email ?? null;
  if (!isAdminEmail(email)) return null;

  return {
    id: user.id,
    email,
    accessToken: session.access_token,
  };
}

/**
 * Guard for route handlers. Returns the administrator together with a client
 * that acts as that administrator, so every privileged read and write is
 * evaluated by Row Level Security under the user's own token.
 */
export async function requireAuth(): Promise<{
  user: AuthedUser;
  client: SupabaseClient;
} | null> {
  try {
    const user = await getUser();
    if (!user) return null;
    const client = await createUserScopedClient(user.accessToken);
    return { user, client };
  } catch {
    return null;
  }
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}
