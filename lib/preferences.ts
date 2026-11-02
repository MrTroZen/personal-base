export const appearances = ["system", "light", "dark"] as const;
export const weekStarts = ["monday", "sunday"] as const;

export type Appearance = (typeof appearances)[number];
export type WeekStart = (typeof weekStarts)[number];
export type UserPreferences = {
  user_id: string;
  appearance: Appearance;
  currency: string;
  timezone: string;
  week_start: WeekStart;
  updated_at: string;
};

export const defaultPreferences = {
  appearance: "system" as Appearance,
  currency: "BDT",
  timezone: "Asia/Dhaka",
  week_start: "monday" as WeekStart,
};

export function preferencesWithDefaults(row: Partial<UserPreferences> | null | undefined) {
  return {
    ...defaultPreferences,
    ...row,
  };
}
