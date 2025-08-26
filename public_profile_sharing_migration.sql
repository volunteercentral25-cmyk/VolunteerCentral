-- =====================================================
-- Public Profile Sharing Migration
-- Adds support for public profile sharing without authentication
-- =====================================================

-- =====================================================
-- NEW RLS POLICIES FOR PUBLIC PROFILE SHARING
-- =====================================================

-- Public profile sharing policies
CREATE POLICY "Public can view profiles with active share tokens" ON profiles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM shareable_profiles 
        WHERE shareable_profiles.profile_id = profiles.id 
        AND shareable_profiles.is_active = true 
        AND (shareable_profiles.expires_at IS NULL OR shareable_profiles.expires_at > now())
    )
);

-- Public volunteer hours sharing policies
CREATE POLICY "Public can view volunteer hours for shared profiles" ON volunteer_hours FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM shareable_profiles 
        WHERE shareable_profiles.profile_id = volunteer_hours.student_id 
        AND shareable_profiles.is_active = true 
        AND (shareable_profiles.expires_at IS NULL OR shareable_profiles.expires_at > now())
    )
);

-- Public opportunity registrations sharing policies
CREATE POLICY "Public can view registrations for shared profiles" ON opportunity_registrations FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM shareable_profiles 
        WHERE shareable_profiles.profile_id = opportunity_registrations.student_id 
        AND shareable_profiles.is_active = true 
        AND (shareable_profiles.expires_at IS NULL OR shareable_profiles.expires_at > now())
    )
);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Public can view profiles with active share tokens" ON profiles IS 'Allows public access to student profiles when they have an active shareable profile token';
COMMENT ON POLICY "Public can view volunteer hours for shared profiles" ON volunteer_hours IS 'Allows public access to volunteer hours for profiles with active share tokens';
COMMENT ON POLICY "Public can view registrations for shared profiles" ON opportunity_registrations IS 'Allows public access to opportunity registrations for profiles with active share tokens';

-- =====================================================
-- MIGRATION COMPLETION
-- =====================================================

-- This migration adds public profile sharing capabilities
-- allowing anyone to view student profiles, volunteer hours, and registrations
-- when they have a valid share token from the shareable_profiles table.
