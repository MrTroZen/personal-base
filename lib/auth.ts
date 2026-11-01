import "server-only";

import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export type OwnerIdentity = {
  email: string;
  initial: string;
};

export function getConfiguredOwnerEmail() {
  return process.env.OWNER_EMAIL?.trim().toLowerCase() ?? null;
}

export function isAuthConfigured() {
  return hasSupabaseConfig() && Boolean(getConfiguredOwnerEmail());
}

export async function getOwnerIdentity(): Promise<OwnerIdentity | null> {
  const configuredEmail = getConfiguredOwnerEmail();

  if (!hasSupabaseConfig() || !configuredEmail) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();
    const claimedEmail = data?.claims.email?.trim().toLowerCase();

    if (error || !claimedEmail || claimedEmail !== configuredEmail) {
      return null;
    }

    return {
      email: claimedEmail,
      initial: claimedEmail.charAt(0).toUpperCase(),
    };
  } catch {
    return null;
  }
}
