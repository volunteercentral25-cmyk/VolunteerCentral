-- Add club fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS beta_club BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nths BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS clubs_completed BOOLEAN DEFAULT FALSE;

-- Create index for club queries
CREATE INDEX IF NOT EXISTS idx_profiles_clubs ON profiles(beta_club, nths);
CREATE INDEX IF NOT EXISTS idx_profiles_clubs_completed ON profiles(clubs_completed);
