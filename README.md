# CATA Volunteer

A comprehensive volunteer management system for CATA (Community Action Through Volunteering) that allows students to log volunteer hours, sign up for opportunities, and enables administrators to manage and approve volunteer activities.

## 🚀 Features

- **Student Features:**
  - Register and login with email verification
  - Browse and sign up for volunteer opportunities
  - Log volunteer hours with descriptions
  - View personal volunteer history and statistics

- **Admin Features:**
  - Create and manage volunteer opportunities
  - View all student volunteer hours
  - Approve/deny volunteer hours with override option
  - Send custom email confirmations for overrides
  - Manage student accounts and registrations

- **Technical Features:**
  - Next.js 14 with React 18 and TypeScript
  - Supabase for database and authentication
  - Row Level Security (RLS) for data protection
  - Flask Mail backend for custom email sending
  - Responsive design with Tailwind CSS
  - Smooth animations with Framer Motion

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Flask (Python) for email services
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod validation
- **UI Components:** Shadcn/ui, Lucide React icons

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- Git

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yatishgrandhe/CATAVolunteer.git
   cd CATAVolunteer
   ```

2. **Install dependencies:**
   ```bash
   npm run install-deps
   ```
   This will install both Node.js and Python dependencies.

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   FLASK_MAIL_SERVER=your_smtp_server
   FLASK_MAIL_PORT=587
   FLASK_MAIL_USE_TLS=true
   FLASK_MAIL_USERNAME=your_email
   FLASK_MAIL_PASSWORD=your_email_password
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

The database schema is automatically created when you first run the application. The system includes:

- **Tables:**
  - `profiles` - User profiles and roles
  - `volunteer_opportunities` - Available volunteer events
  - `opportunity_registrations` - Student sign-ups
  - `volunteer_hours` - Logged volunteer hours
  - `email_verifications` - Email verification tokens

- **Security:**
  - Row Level Security (RLS) policies
  - User-based data access control
  - Admin override capabilities

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard:**
   - Go to your project settings
   - Add all environment variables from `.env.local`

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
CATAVolunteer/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components
│   └── lib/                  # Utility libraries
│       └── supabase/         # Supabase configuration
├── api/                      # Flask API for email services
│   ├── flask_app.py         # Main Flask application
│   └── requirements.txt     # Python dependencies
├── public/                  # Static assets
│   └── images/             # Images including CATA logo
├── supabase/               # Database migrations
│   ├── migrations/         # SQL migration files
│   └── seed.sql           # Sample data
├── vercel.json            # Vercel configuration
└── package.json           # Node.js dependencies
```

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Copy your project URL and API keys
3. Update environment variables
4. Run database migrations

### Email Configuration
1. Set up SMTP server credentials
2. Configure Flask Mail settings
3. Test email functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the GitHub repository.

---

**CATA Volunteer** - Empowering communities through volunteerism 🎯
