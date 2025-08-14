-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'admin');
CREATE TYPE registration_status AS ENUM ('registered', 'attended', 'no_show');
CREATE TYPE hours_status AS ENUM ('pending', 'approved', 'denied', 'override_pending');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    student_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create volunteer_opportunities table
CREATE TABLE IF NOT EXISTS volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_participants INTEGER DEFAULT 0,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create opportunity_registrations table
CREATE TABLE IF NOT EXISTS opportunity_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status registration_status DEFAULT 'registered',
    UNIQUE(opportunity_id, student_id)
);

-- Create volunteer_hours table
CREATE TABLE IF NOT EXISTS volunteer_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE SET NULL,
    hours DECIMAL(5,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    status hours_status DEFAULT 'pending',
    override_email TEXT,
    override_token UUID,
    approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    token UUID NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_date ON volunteer_opportunities(date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_by ON volunteer_opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_registrations_opportunity_id ON opportunity_registrations(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON opportunity_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_hours_student_id ON volunteer_hours(student_id);
CREATE INDEX IF NOT EXISTS idx_hours_status ON volunteer_hours(status);
CREATE INDEX IF NOT EXISTS idx_hours_date ON volunteer_hours(date);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON volunteer_opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
