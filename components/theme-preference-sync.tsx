"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Appearance } from "@/lib/preferences";

const storageKey = "personal-base-appearance";

export function applyAppearance(appearance: Appearance) {
  if (appearance === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = appearance;
  window.localStorage.setItem(storageKey, appearance);
}

export function ThemePreferenceSync() {
  useEffect(() => {
    if (window.sessionStorage.getItem("personal-base-preferences-synced")) return;
    window.sessionStorage.setItem("personal-base-preferences-synced", "true");
    const supabase = createClient();
    void supabase.from("user_preferences").select("appearance").maybeSingle().then(({ data }) => {
      const appearance = data?.appearance as Appearance | undefined;
      if (appearance) applyAppearance(appearance);
    });
  }, []);
  return null;
}
