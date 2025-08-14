-- Insert sample admin user (using your existing profile)
INSERT INTO profiles (id, email, full_name, role, student_id) 
VALUES (
    'a5253d96-d792-45e6-88dc-99d4044ae119',
    'yatish.grandhe@gmail.com',
    'Yatish Grandhe',
    'admin',
    'ADMIN001'
) ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- Insert sample volunteer opportunities
INSERT INTO volunteer_opportunities (title, description, location, date, start_time, end_time, max_participants, created_by) VALUES
(
    'Community Garden Cleanup',
    'Help clean and maintain the community garden. Tasks include weeding, planting, and general maintenance.',
    'Central Park Community Garden',
    '2024-01-20',
    '09:00:00',
    '17:00:00',
    15,
    'a5253d96-d792-45e6-88dc-99d4044ae119'
),
(
    'Food Bank Distribution',
    'Assist with sorting and distributing food items to families in need.',
    'Local Food Bank',
    '2024-01-25',
    '10:00:00',
    '16:00:00',
    20,
    'a5253d96-d792-45e6-88dc-99d4044ae119'
),
(
    'Senior Center Activities',
    'Help organize and participate in activities for senior citizens.',
    'Golden Years Senior Center',
    '2024-01-30',
    '14:00:00',
    '18:00:00',
    10,
    'a5253d96-d792-45e6-88dc-99d4044ae119'
),
(
    'Library Book Organization',
    'Assist with organizing and cataloging books in the local library.',
    'Public Library',
    '2024-02-05',
    '13:00:00',
    '17:00:00',
    8,
    'a5253d96-d792-45e6-88dc-99d4044ae119'
),
(
    'Animal Shelter Support',
    'Help care for animals and assist with daily operations at the shelter.',
    'Paws & Care Animal Shelter',
    '2024-02-10',
    '09:00:00',
    '15:00:00',
    12,
    'a5253d96-d792-45e6-88dc-99d4044ae119'
);

-- Insert sample student profiles
INSERT INTO profiles (email, full_name, role, student_id) VALUES
('student1@example.com', 'John Smith', 'student', 'STU001'),
('student2@example.com', 'Sarah Johnson', 'student', 'STU002'),
('student3@example.com', 'Michael Brown', 'student', 'STU003'),
('student4@example.com', 'Emily Davis', 'student', 'STU004'),
('student5@example.com', 'David Wilson', 'student', 'STU005');

-- Insert sample volunteer hours
INSERT INTO volunteer_hours (student_id, opportunity_id, hours, date, description, status) VALUES
(
    (SELECT id FROM profiles WHERE email = 'student1@example.com'),
    (SELECT id FROM volunteer_opportunities WHERE title = 'Community Garden Cleanup'),
    8.0,
    '2024-01-20',
    'Helped with weeding and planting new flowers',
    'approved'
),
(
    (SELECT id FROM profiles WHERE email = 'student2@example.com'),
    (SELECT id FROM volunteer_opportunities WHERE title = 'Food Bank Distribution'),
    6.0,
    '2024-01-25',
    'Assisted with sorting and packaging food items',
    'pending'
),
(
    (SELECT id FROM profiles WHERE email = 'student3@example.com'),
    (SELECT id FROM volunteer_opportunities WHERE title = 'Senior Center Activities'),
    4.0,
    '2024-01-30',
    'Helped organize bingo games and social activities',
    'approved'
);

-- Insert sample registrations
INSERT INTO opportunity_registrations (opportunity_id, student_id, status) VALUES
(
    (SELECT id FROM volunteer_opportunities WHERE title = 'Community Garden Cleanup'),
    (SELECT id FROM profiles WHERE email = 'student1@example.com'),
    'attended'
),
(
    (SELECT id FROM volunteer_opportunities WHERE title = 'Food Bank Distribution'),
    (SELECT id FROM profiles WHERE email = 'student2@example.com'),
    'registered'
),
(
    (SELECT id FROM volunteer_opportunities WHERE title = 'Senior Center Activities'),
    (SELECT id FROM profiles WHERE email = 'student3@example.com'),
    'attended'
);
