-- =====================================================
-- CATA Volunteer Central Database Setup Script
-- Complete database recreation script
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User role enum
CREATE TYPE user_role AS ENUM ('student', 'admin');

-- Registration status enum
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'denied');

-- Hours status enum
CREATE TYPE hours_status AS ENUM ('pending', 'approved', 'denied');

-- =====================================================
-- TABLES
-- =====================================================

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email logs table
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    recipient TEXT NOT NULL,
    template TEXT NOT NULL,
    subject TEXT,
    data JSONB,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    error TEXT
);

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    bio TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    student_id VARCHAR UNIQUE,
    role VARCHAR DEFAULT 'student',
    beta_club BOOLEAN DEFAULT FALSE,
    nths BOOLEAN DEFAULT FALSE,
    clubs_completed BOOLEAN DEFAULT FALSE
);

-- Opportunities table (legacy)
CREATE TABLE opportunities (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    hours_required INTEGER,
    slots_available INTEGER,
    slots_filled INTEGER DEFAULT 0,
    image_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations table (legacy)
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    opportunity_id INTEGER REFERENCES opportunities(id),
    status TEXT DEFAULT 'registered',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteer logs table (legacy)
CREATE TABLE volunteer_logs (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES profiles(id),
    opportunity_id INTEGER REFERENCES opportunities(id),
    hours_logged NUMERIC NOT NULL,
    date_volunteered DATE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteer opportunities table (new)
CREATE TABLE volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    description TEXT,
    location VARCHAR,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    max_volunteers INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    requirements TEXT,
    club_restriction TEXT DEFAULT 'anyone' CHECK (club_restriction = ANY (ARRAY['anyone', 'beta_club', 'nths', 'both']))
);

-- Opportunity registrations table (new)
CREATE TABLE opportunity_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES volunteer_opportunities(id),
    student_id UUID REFERENCES profiles(id),
    status registration_status DEFAULT 'pending',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteer hours table (new)
CREATE TABLE volunteer_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id),
    opportunity_id UUID REFERENCES volunteer_opportunities(id),
    hours NUMERIC NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    status hours_status DEFAULT 'pending',
    admin_override_email VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    verification_email TEXT,
    verified_by TEXT,
    verification_date TIMESTAMPTZ,
    verification_notes TEXT
);

-- Add column comments for volunteer_hours table
COMMENT ON COLUMN volunteer_hours.verification_email IS 'Email address of the supervisor/organization that will verify these hours';
COMMENT ON COLUMN volunteer_hours.verified_by IS 'Email address of the person who verified these hours';
COMMENT ON COLUMN volunteer_hours.verification_date IS 'Date and time when the hours were verified';
COMMENT ON COLUMN volunteer_hours.verification_notes IS 'Optional notes from the verifier';

-- Email verifications table
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL,
    token VARCHAR NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email domain management table
CREATE TABLE email_domain_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR NOT NULL UNIQUE,
    status VARCHAR NOT NULL CHECK (status = ANY (ARRAY['blocked', 'allowed'])),
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shareable profiles table
CREATE TABLE shareable_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id),
    share_token VARCHAR NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);

-- Trusted email domains table
CREATE TABLE trusted_email_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL UNIQUE,
    is_trusted BOOLEAN DEFAULT TRUE,
    reason TEXT,
    added_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_student_id ON profiles(student_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Volunteer opportunities indexes
CREATE INDEX idx_volunteer_opportunities_date ON volunteer_opportunities(date);
CREATE INDEX idx_volunteer_opportunities_created_by ON volunteer_opportunities(created_by);

-- Opportunity registrations indexes
CREATE INDEX idx_opportunity_registrations_opportunity_id ON opportunity_registrations(opportunity_id);
CREATE INDEX idx_opportunity_registrations_student_id ON opportunity_registrations(student_id);
CREATE INDEX idx_opportunity_registrations_status ON opportunity_registrations(status);

-- Volunteer hours indexes
CREATE INDEX idx_volunteer_hours_student_id ON volunteer_hours(student_id);
CREATE INDEX idx_volunteer_hours_opportunity_id ON volunteer_hours(opportunity_id);
CREATE INDEX idx_volunteer_hours_status ON volunteer_hours(status);
CREATE INDEX idx_volunteer_hours_date ON volunteer_hours(date);

-- Email verifications indexes
CREATE INDEX idx_email_verifications_email ON email_verifications(email);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Trusted email domains indexes
CREATE INDEX idx_trusted_email_domains_domain ON trusted_email_domains(domain);
CREATE INDEX idx_trusted_email_domains_is_trusted ON trusted_email_domains(is_trusted);

-- Shareable profiles indexes
CREATE INDEX idx_shareable_profiles_profile_id ON shareable_profiles(profile_id);
CREATE INDEX idx_shareable_profiles_share_token ON shareable_profiles(share_token);
CREATE INDEX idx_shareable_profiles_is_active ON shareable_profiles(is_active);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_opportunities_updated_at
    BEFORE UPDATE ON volunteer_opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunity_registrations_updated_at
    BEFORE UPDATE ON opportunity_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_volunteer_hours_updated_at
    BEFORE UPDATE ON volunteer_hours
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_domain_management_updated_at
    BEFORE UPDATE ON email_domain_management
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Get domain trust info function
CREATE OR REPLACE FUNCTION get_domain_trust_info(domain_name TEXT)
RETURNS TABLE (
    domain TEXT,
    is_trusted BOOLEAN,
    reason TEXT,
    exists_in_db BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lower(domain_name) as domain,
        COALESCE(ted.is_trusted, true) as is_trusted,
        ted.reason,
        (ted.id IS NOT NULL) as exists_in_db
    FROM (SELECT lower(domain_name) as domain_param) params
    LEFT JOIN trusted_email_domains ted ON ted.domain = params.domain_param;
END;
$$ LANGUAGE plpgsql;

-- Get admin students count function
CREATE OR REPLACE FUNCTION get_admin_students_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM profiles
        WHERE role = 'student'
    );
END;
$$ LANGUAGE plpgsql;

-- Get admin students with stats function
CREATE OR REPLACE FUNCTION get_admin_students_with_stats()
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    student_id VARCHAR,
    role VARCHAR,
    beta_club BOOLEAN,
    nths BOOLEAN,
    clubs_completed BOOLEAN,
    total_hours NUMERIC,
    total_opportunities INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.full_name,
        p.email,
        p.student_id,
        p.role,
        p.beta_club,
        p.nths,
        p.clubs_completed,
        COALESCE(SUM(vh.hours), 0) as total_hours,
        COUNT(DISTINCT vh.opportunity_id)::INTEGER as total_opportunities,
        p.created_at
    FROM profiles p
    LEFT JOIN volunteer_hours vh ON p.id = vh.student_id AND vh.status = 'approved'
    WHERE p.role = 'student'
    GROUP BY p.id, p.full_name, p.email, p.student_id, p.role, p.beta_club, p.nths, p.clubs_completed, p.created_at
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get admin hours count function
CREATE OR REPLACE FUNCTION get_admin_hours_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM volunteer_hours
        WHERE status = 'pending'
    );
END;
$$ LANGUAGE plpgsql;

-- Get admin hours with details function
CREATE OR REPLACE FUNCTION get_admin_hours_with_details()
RETURNS TABLE (
    id UUID,
    student_id UUID,
    opportunity_id UUID,
    hours NUMERIC,
    date DATE,
    description TEXT,
    status hours_status,
    verification_email TEXT,
    verified_by TEXT,
    verification_date TIMESTAMPTZ,
    verification_notes TEXT,
    created_at TIMESTAMPTZ,
    student_name TEXT,
    student_email TEXT,
    opportunity_title VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vh.id,
        vh.student_id,
        vh.opportunity_id,
        vh.hours,
        vh.date,
        vh.description,
        vh.status,
        vh.verification_email,
        vh.verified_by,
        vh.verification_date,
        vh.verification_notes,
        vh.created_at,
        p.full_name as student_name,
        p.email as student_email,
        vo.title as opportunity_title
    FROM volunteer_hours vh
    LEFT JOIN profiles p ON vh.student_id = p.id
    LEFT JOIN volunteer_opportunities vo ON vh.opportunity_id = vo.id
    ORDER BY vh.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get admin registrations with profiles function
CREATE OR REPLACE FUNCTION get_admin_registrations_with_profiles()
RETURNS TABLE (
    id UUID,
    opportunity_id UUID,
    student_id UUID,
    status registration_status,
    registered_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    student_name TEXT,
    student_email TEXT,
    opportunity_title VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
                 oreg.id,
         oreg.opportunity_id,
         oreg.student_id,
         oreg.status,
         oreg.registered_at,
         oreg.updated_at,
        p.full_name as student_name,
        p.email as student_email,
        vo.title as opportunity_title
    FROM opportunity_registrations oreg
    LEFT JOIN profiles p ON oreg.student_id = p.id
    LEFT JOIN volunteer_opportunities vo ON oreg.opportunity_id = vo.id
    ORDER BY oreg.registered_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get student volunteer history function
CREATE OR REPLACE FUNCTION get_student_volunteer_history(student_uuid UUID)
RETURNS TABLE (
    id UUID,
    opportunity_id UUID,
    hours NUMERIC,
    date DATE,
    description TEXT,
    status hours_status,
    opportunity_title VARCHAR,
    opportunity_location VARCHAR,
    opportunity_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vh.id,
        vh.opportunity_id,
        vh.hours,
        vh.date,
        vh.description,
        vh.status,
        vo.title as opportunity_title,
        vo.location as opportunity_location,
        vo.date as opportunity_date
    FROM volunteer_hours vh
    LEFT JOIN volunteer_opportunities vo ON vh.opportunity_id = vo.id
    WHERE vh.student_id = student_uuid
    ORDER BY vh.date DESC;
END;
$$ LANGUAGE plpgsql;

-- Handle new user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Is domain trusted function
CREATE OR REPLACE FUNCTION is_domain_trusted(domain_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  SELECT COALESCE(
    (SELECT is_trusted FROM trusted_email_domains WHERE domain = lower(domain_name)),
    true  -- Default to trusted if not found
  );
END;
$$ LANGUAGE plpgsql;

-- Update admin registration status function
CREATE OR REPLACE FUNCTION update_admin_registration_status(registration_uuid UUID, new_status registration_status)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE opportunity_registrations 
  SET status = new_status, updated_at = NOW()
  WHERE id = registration_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Delete admin registration function
CREATE OR REPLACE FUNCTION delete_admin_registration(registration_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM opportunity_registrations 
  WHERE id = registration_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_domain_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_email_domains ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role can access all profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Volunteer opportunities policies
CREATE POLICY "Anyone can view opportunities" ON volunteer_opportunities FOR SELECT USING (true);
CREATE POLICY "Admins can create opportunities" ON volunteer_opportunities FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update opportunities" ON volunteer_opportunities FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can delete opportunities" ON volunteer_opportunities FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Opportunity registrations policies
CREATE POLICY "Users can view own registrations" ON opportunity_registrations FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Users can create own registrations" ON opportunity_registrations FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins can view all registrations" ON opportunity_registrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update all registrations" ON opportunity_registrations FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Volunteer hours policies
CREATE POLICY "Users can view own hours" ON volunteer_hours FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Users can create own hours" ON volunteer_hours FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "Admins can view all hours" ON volunteer_hours FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can approve/deny hours" ON volunteer_hours FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Trusted email domains policies
CREATE POLICY "Admins can view all domains" ON trusted_email_domains FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can insert domains" ON trusted_email_domains FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can update domains" ON trusted_email_domains FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admins can delete domains" ON trusted_email_domains FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Shareable profiles policies
CREATE POLICY "Users can view their own shareable profiles" ON shareable_profiles FOR SELECT USING (
    profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid())
);
CREATE POLICY "Users can create their own shareable profiles" ON shareable_profiles FOR INSERT WITH CHECK (
    profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid())
);
CREATE POLICY "Users can update their own shareable profiles" ON shareable_profiles FOR UPDATE USING (
    profile_id IN (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid())
);
CREATE POLICY "Anyone can view active shareable profiles by token" ON shareable_profiles FOR SELECT USING (
    is_active = true AND (expires_at IS NULL OR expires_at > now())
);

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

-- Email verifications policies
CREATE POLICY "Users can view own verifications" ON email_verifications FOR SELECT USING (
    email = (SELECT profiles.email FROM profiles WHERE profiles.id = auth.uid())
);
CREATE POLICY "Users can create own verifications" ON email_verifications FOR INSERT WITH CHECK (
    email = (SELECT profiles.email FROM profiles WHERE profiles.id = auth.uid())
);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Opportunities policies (legacy)
CREATE POLICY "Opportunities are viewable by everyone" ON opportunities FOR SELECT USING (true);
CREATE POLICY "Creators can manage their opportunities" ON opportunities FOR ALL USING (auth.uid() = created_by);
CREATE POLICY "Admins can insert opportunities" ON opportunities FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins can update opportunities" ON opportunities FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins can delete opportunities" ON opportunities FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Registrations policies (legacy)
CREATE POLICY "Users can view their own registrations" ON registrations FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can register themselves" ON registrations FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own registrations" ON registrations FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own registrations" ON registrations FOR DELETE USING (auth.uid() = profile_id);
CREATE POLICY "Admins can view all registrations" ON registrations FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Volunteer logs policies (legacy)
CREATE POLICY "Users can view their own volunteer logs" ON volunteer_logs FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Users can log their own hours" ON volunteer_logs FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can update their own volunteer logs" ON volunteer_logs FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Users can delete their own volunteer logs" ON volunteer_logs FOR DELETE USING (auth.uid() = profile_id);
CREATE POLICY "Admins can view all volunteer logs" ON volunteer_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);
CREATE POLICY "Admins can update all volunteer logs" ON volunteer_logs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- Email domain management policies
CREATE POLICY "Users can read email domain management" ON email_domain_management FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage email domains" ON email_domain_management FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Community Service', 'Volunteer opportunities focused on community improvement'),
('Education', 'Educational and tutoring opportunities'),
('Healthcare', 'Healthcare and medical support opportunities'),
('Environmental', 'Environmental conservation and sustainability'),
('Animal Welfare', 'Animal care and protection opportunities');

-- Insert sample trusted email domains
INSERT INTO trusted_email_domains (domain, is_trusted, reason) VALUES
('tempmail.org', false, 'Disposable email service'),
('ny.gov', false, 'Blocked by admin request');

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE volunteer_opportunities IS 'Volunteer opportunities that students can register for';
COMMENT ON TABLE opportunity_registrations IS 'Student registrations for volunteer opportunities';
COMMENT ON TABLE volunteer_hours IS 'Volunteer hours logged by students with verification system';
COMMENT ON TABLE trusted_email_domains IS 'Email domain trust management for verification system';
COMMENT ON TABLE shareable_profiles IS 'Public shareable student profiles';
COMMENT ON TABLE email_verifications IS 'Email verification tokens for hours verification';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This script creates the complete CATA Volunteer Central database structure
-- including all tables, enums, functions, triggers, RLS policies, and sample data.
-- Run this script on a fresh Supabase database to recreate the entire system.
