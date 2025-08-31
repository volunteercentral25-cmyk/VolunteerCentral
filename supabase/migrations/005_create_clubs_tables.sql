-- Create clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_club_supervision table
CREATE TABLE IF NOT EXISTS admin_club_supervision (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, club_id)
);

-- Insert default clubs
INSERT INTO clubs (name, description) VALUES 
    ('Beta Club', 'National Beta Club'),
    ('NTHS', 'National Technical Honor Society')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clubs_name ON clubs(name);
CREATE INDEX IF NOT EXISTS idx_admin_club_supervision_admin_id ON admin_club_supervision(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_club_supervision_club_id ON admin_club_supervision(club_id);

-- Enable RLS on new tables
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_club_supervision ENABLE ROW LEVEL SECURITY;

-- RLS policies for clubs table
CREATE POLICY "Anyone can view clubs" ON clubs
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage clubs" ON clubs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS policies for admin_club_supervision table
CREATE POLICY "Admins can view their own club supervision" ON admin_club_supervision
    FOR SELECT USING (admin_id = auth.uid());

CREATE POLICY "Admins can manage their own club supervision" ON admin_club_supervision
    FOR ALL USING (admin_id = auth.uid());

-- Create trigger for updated_at on clubs table
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
