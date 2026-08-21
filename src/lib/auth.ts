import { supabase } from "@/integrations/supabase/client";

// Username-only auth: map username -> synthetic email under a fake domain.
const DOMAIN = "thunder.local";

function toEmail(username: string) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
  return `${clean}@${DOMAIN}`;
}

export function usernameFromEmail(email: string | undefined | null) {
  if (!email) return "";
  return email.endsWith(`@${DOMAIN}`) ? email.slice(0, -1 - DOMAIN.length) : email;
}

export function validateUsername(username: string) {
  const u = username.trim();
  if (u.length < 3) return "Username must be at least 3 characters";
  if (!/^[a-zA-Z0-9_.-]+$/.test(u)) return "Only letters, numbers, . _ -";
  return null;
}

export async function signUp(username: string, password: string) {
  return supabase.auth.signUp({
    email: toEmail(username),
    password,
    options: { data: { username: username.trim() } },
  });
}

export async function signIn(username: string, password: string) {
  return supabase.auth.signInWithPassword({
    email: toEmail(username),
    password,
  });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export function validateAniListUsername(username: string) {
  const u = username.trim();
  if (!u) return null; // empty clears the connection
  if (!/^[A-Za-z0-9_-]{2,20}$/.test(u)) return "Enter a valid AniList username";
  return null;
}

export async function updateAniListUsername(username: string) {
  const clean = username.trim();
  return supabase.auth.updateUser({ data: { anilist_username: clean || null } });
}
