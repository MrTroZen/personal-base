"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getConfiguredOwnerEmail, isAuthConfigured } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  message: string;
} | null;

const INVALID_CREDENTIALS = "The email or password is incorrect.";

export async function signIn(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const ownerEmail = getConfiguredOwnerEmail();

  if (!isAuthConfigured()) {
    return { message: "Authentication is not configured yet." };
  }

  if (!email || !password || email !== ownerEmail) {
    return { message: INVALID_CREDENTIALS };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { message: INVALID_CREDENTIALS };
  }

  const { data, error: claimsError } = await supabase.auth.getClaims();
  const claimedEmail = data?.claims.email?.trim().toLowerCase();

  if (claimsError || claimedEmail !== ownerEmail) {
    await supabase.auth.signOut({ scope: "local" });
    return { message: INVALID_CREDENTIALS };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/sign-in");
}
