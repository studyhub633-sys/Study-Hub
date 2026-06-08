-- Onboarding fields for profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS study_level TEXT;

-- Existing users with profile details should skip onboarding
UPDATE profiles
SET onboarding_completed = TRUE
WHERE onboarding_completed IS DISTINCT FROM TRUE
  AND full_name IS NOT NULL
  AND year_group IS NOT NULL
  AND subjects IS NOT NULL
  AND subjects <> '';
