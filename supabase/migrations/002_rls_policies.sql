-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Volunteer opportunities policies
CREATE POLICY "Anyone can view opportunities" ON volunteer_opportunities
    FOR SELECT USING (true);

CREATE POLICY "Admins can create opportunities" ON volunteer_opportunities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update opportunities" ON volunteer_opportunities
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete opportunities" ON volunteer_opportunities
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Opportunity registrations policies
CREATE POLICY "Users can view their own registrations" ON opportunity_registrations
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Users can register for opportunities" ON opportunity_registrations
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can update their own registrations" ON opportunity_registrations
    FOR UPDATE USING (student_id = auth.uid());

CREATE POLICY "Admins can view all registrations" ON opportunity_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all registrations" ON opportunity_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Volunteer hours policies
CREATE POLICY "Users can view their own hours" ON volunteer_hours
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Users can log their own hours" ON volunteer_hours
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can update their own pending hours" ON volunteer_hours
    FOR UPDATE USING (
        student_id = auth.uid() AND status = 'pending'
    );

CREATE POLICY "Admins can view all hours" ON volunteer_hours
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can approve/deny hours" ON volunteer_hours
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Email verifications policies
CREATE POLICY "Users can view their own verifications" ON email_verifications
    FOR SELECT USING (email = (
        SELECT email FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can create verifications" ON email_verifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own verifications" ON email_verifications
    FOR UPDATE USING (email = (
        SELECT email FROM profiles WHERE id = auth.uid()
    ));
