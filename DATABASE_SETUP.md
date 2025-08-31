# Database Setup Instructions

## Manual Database Migration

Since the Supabase CLI is not available in the deployment environment, you'll need to manually apply the database migration through the Supabase dashboard.

### Steps to Apply Migration:

1. **Log into your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Apply the Migration**
   - Copy and paste the following SQL into the editor:

```sql
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
```

4. **Execute the SQL**
   - Click "Run" to execute the migration

5. **Verify the Tables**
   - Go to "Table Editor" in the left sidebar
   - You should see the new `clubs` and `admin_club_supervision` tables

### Environment Variables

Make sure these environment variables are set in your Vercel deployment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Deployment Status

The application should now deploy successfully with:
- ✅ Updated `pnpm-lock.yaml` file
- ✅ All dependencies properly installed
- ✅ Graceful error handling for missing database tables
- ✅ React error boundaries for better user experience

The admin dashboard and students page will work even if the database tables are missing, providing appropriate fallback responses.
