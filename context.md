# CATA Volunteer - Student Hours Tracking System

## Project Overview

A comprehensive web application for tracking student volunteer hours where students can log hours, sign up for opportunities, and admins can manage everything. Built with Next.js, React, Supabase, and Flask Mail for email notifications. Features the official CATA logo and branding throughout the application.

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion (animations)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email Service**: Flask Mail (Python backend)
- **Deployment**: Vercel
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Shadcn/ui, Lucide React icons

## File Structure

```
cata-volunteer-central/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── verify-email/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── student/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── opportunities/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── hours/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx
│   │   │       ├── students/
│   │   │       │   └── page.tsx
│   │   │       ├── opportunities/
│   │   │       │   └── page.tsx
│   │   │       ├── hours/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts
│   │   │   ├── email/
│   │   │   │   └── route.ts
│   │   │   ├── hours/
│   │   │   │   ├── approve/
│   │   │   │   │   └── route.ts
│   │   │   │   └── override/
│   │   │   │       └── route.ts
│   │   │   └── opportunities/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── form.tsx
│   │   │   └── toast.tsx
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── email-verification.tsx
│   │   ├── dashboard/
│   │   │   ├── student/
│   │   │   │   ├── hours-logger.tsx
│   │   │   │   ├── opportunity-card.tsx
│   │   │   │   ├── hours-summary.tsx
│   │   │   │   └── profile-form.tsx
│   │   │   └── admin/
│   │   │       ├── student-table.tsx
│   │   │       ├── opportunity-form.tsx
│   │   │       ├── hours-approval.tsx
│   │   │       └── stats-cards.tsx
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── footer.tsx
│   │   └── shared/
│   │       ├── loading-spinner.tsx
│   │       ├── error-boundary.tsx
│   │       └── confirm-dialog.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   └── constants.ts
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-hours.ts
│   │   ├── use-opportunities.ts
│   │   └── use-students.ts
│   └── store/
│       ├── auth-store.ts
│       ├── hours-store.ts
│       └── opportunities-store.ts
├── public/
│   ├── images/
│   │   └── cata-logo.png
│   └── icons/
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_auth_tables.sql
│   │   ├── 003_opportunities.sql
│   │   ├── 004_hours_logging.sql
│   │   └── 005_email_verification.sql
│   └── seed.sql
├── api/
│   ├── flask_app.py
│   ├── requirements.txt
│   └── email_templates/
│       ├── verification.html
│       ├── hours_override.html
│       └── approval_notification.html
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── vercel.json
├── .env.local
├── .gitignore
└── README.md
```

## Database Schema (Supabase)

### Tables

1. **profiles**
   - id (uuid, primary key)
   - email (text, unique)
   - student_id (text, unique)
   - full_name (text)
   - role (enum: 'student', 'admin')
   - created_at (timestamp)
   - updated_at (timestamp)

2. **volunteer_opportunities**
   - id (uuid, primary key)
   - title (text)
   - description (text)
   - location (text)
   - date (date)
   - start_time (time)
   - end_time (time)
   - max_participants (integer)
   - created_by (uuid, foreign key to profiles)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **opportunity_registrations**
   - id (uuid, primary key)
   - opportunity_id (uuid, foreign key)
   - student_id (uuid, foreign key to profiles)
   - registered_at (timestamp)
   - status (enum: 'registered', 'attended', 'no_show')

4. **volunteer_hours**
   - id (uuid, primary key)
   - student_id (uuid, foreign key to profiles)
   - opportunity_id (uuid, foreign key, nullable)
   - hours (decimal)
   - date (date)
   - description (text)
   - status (enum: 'pending', 'approved', 'denied', 'override_pending')
   - override_email (text, nullable)
   - override_token (uuid, nullable)
   - approved_by (uuid, foreign key to profiles, nullable)
   - approved_at (timestamp, nullable)
   - created_at (timestamp)

5. **email_verifications**
   - id (uuid, primary key)
   - email (text)
   - token (uuid)
   - expires_at (timestamp)
   - verified_at (timestamp, nullable)

## Step-by-Step Implementation

### Phase 1: Project Setup

1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest cata-volunteer-central --typescript --tailwind --eslint
   cd cata-volunteer-central
   ```

2. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
   npm install framer-motion zustand react-hook-form @hookform/resolvers zod
   npm install lucide-react @radix-ui/react-dialog @radix-ui/react-toast
   npm install shadcn/ui
   ```

3. **Setup Supabase**
   - Create new Supabase project
   - Configure authentication settings
   - Set up Row Level Security (RLS)
   - Run database migrations

### Phase 2: Database Setup

1. **Create Tables** (using Supabase MCP)
   - Execute SQL migrations
   - Set up RLS policies
   - Create indexes for performance

2. **Configure Authentication**
   - Enable email verification
   - Set up custom email templates
   - Configure redirect URLs

### Phase 3: Authentication System

1. **Registration Flow**
   - Student registration form
   - Email verification
   - Student ID validation

2. **Login System**
   - Email/password authentication
   - Role-based redirects
   - Session management

### Phase 4: Student Dashboard

1. **Hours Logging**
   - Log volunteer hours
   - View pending/approved hours
   - Request override for missing opportunities

2. **Opportunity Management**
   - Browse available opportunities
   - Register for events
   - View registration history

### Phase 5: Admin Dashboard

1. **Student Management**
   - View all students
   - Manage student accounts
   - View student statistics

2. **Opportunity Management**
   - Create/edit opportunities
   - Manage registrations
   - Track attendance

3. **Hours Approval**
   - Review pending hours
   - Approve/deny submissions
   - Handle override requests

### Phase 6: Email System

1. **Flask Backend Setup**
   - Configure Flask Mail
   - Create email templates
   - Set up SMTP settings

2. **Email Notifications**
   - Verification emails
   - Override request emails
   - Approval notifications

### Phase 7: UI/UX Implementation

1. **Responsive Design**
   - Mobile-first approach
   - Tablet/desktop optimization
   - Accessibility compliance

2. **Animations**
   - Page transitions
   - Loading states
   - Interactive elements

### Phase 8: Deployment

1. **Vercel Setup**
   - Connect GitHub repository
   - Configure environment variables
   - Set up custom domain

2. **Production Configuration**
   - Environment variables
   - Database connections
   - Email service setup

## Key Features

### Student Features
- ✅ Account registration with email verification
- ✅ Log volunteer hours with descriptions
- ✅ Browse and register for opportunities
- ✅ Request override for missing opportunities
- ✅ View hours history and status
- ✅ Profile management

### Admin Features
- ✅ View all student accounts and hours
- ✅ Create and manage volunteer opportunities
- ✅ Approve/deny volunteer hours
- ✅ Handle override requests via email
- ✅ Delete students from opportunities
- ✅ Analytics and reporting

### System Features
- ✅ Email verification system
- ✅ Custom domain email notifications
- ✅ Secure authentication with Supabase
- ✅ Real-time updates
- ✅ Responsive design with animations
- ✅ Role-based access control

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Flask)
FLASK_MAIL_SERVER=smtp.gmail.com
FLASK_MAIL_PORT=587
FLASK_MAIL_USE_TLS=true
FLASK_MAIL_USERNAME=your_email@cata-volunteer.org
FLASK_MAIL_PASSWORD=your_app_password

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
JWT_SECRET=your_jwt_secret
```

## Security Considerations

1. **Row Level Security (RLS)** enabled on all tables
2. **Email verification** required for all accounts
3. **Role-based access** control
4. **Input validation** with Zod schemas
5. **CSRF protection** on forms
6. **Rate limiting** on API endpoints
7. **Secure email tokens** for override requests

## Performance Optimizations

1. **Database indexing** on frequently queried columns
2. **Pagination** for large datasets
3. **Caching** with React Query
4. **Image optimization** with Next.js
5. **Code splitting** for better load times
6. **CDN** for static assets

## Testing Strategy

1. **Unit tests** for utility functions
2. **Integration tests** for API endpoints
3. **E2E tests** for critical user flows
4. **Database tests** for migrations
5. **Email delivery tests**

## Monitoring & Analytics

1. **Error tracking** with Sentry
2. **Performance monitoring** with Vercel Analytics
3. **Database monitoring** with Supabase
4. **Email delivery tracking**
5. **User activity analytics**

This comprehensive setup ensures a robust, scalable, and user-friendly volunteer hours tracking system ready for production deployment.
