import type { SupabaseClient } from "@supabase/supabase-js";

export const STUDY_LEVELS = [
  { value: "gcse", label: "GCSE" },
  { value: "a-level", label: "A-Level" },
  { value: "ks3", label: "KS3" },
  { value: "other", label: "Other" },
] as const;

export const YEAR_GROUPS = [
  { value: "7", label: "Year 7" },
  { value: "8", label: "Year 8" },
  { value: "9", label: "Year 9" },
  { value: "10", label: "Year 10" },
  { value: "11", label: "Year 11" },
  { value: "12", label: "Year 12" },
  { value: "13", label: "Year 13" },
] as const;

export const GCSE_SUBJECTS = [
  "Mathematics",
  "English Language",
  "English Literature",
  "Biology",
  "Chemistry",
  "Physics",
  "Combined Science",
  "History",
  "Geography",
  "Computer Science",
  "French",
  "Spanish",
  "Business Studies",
  "Economics",
  "Psychology",
  "Religious Studies",
  "Art & Design",
  "Music",
  "PE",
  "Drama",
] as const;

export type ProfileOnboardingRow = {
  onboarding_completed?: boolean | null;
  full_name?: string | null;
  year_group?: string | null;
  study_level?: string | null;
  subjects?: string | null;
};

export function isProfileOnboardingComplete(profile: ProfileOnboardingRow | null | undefined): boolean {
  if (!profile) return false;
  if (profile.onboarding_completed) return true;

  return Boolean(
    profile.full_name?.trim() &&
      profile.year_group?.trim() &&
      profile.subjects?.trim()
  );
}

export async function fetchOnboardingStatus(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed, full_name, year_group, study_level, subjects")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  return isProfileOnboardingComplete(data);
}
