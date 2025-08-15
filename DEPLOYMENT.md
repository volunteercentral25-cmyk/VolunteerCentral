# Vercel Deployment Guide

## Project Structure
This project is configured to deploy the pages from the `src/` directory to Vercel.

### Key Files:
- `vercel.json` - Vercel configuration
- `next.config.mjs` - Next.js configuration
- `.vercelignore` - Files to exclude from deployment
- `app/` - Contains the pages from `src/app/` (copied for Vercel compatibility)

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

## Configuration Details

### Vercel Configuration (`vercel.json`)
- Uses `@vercel/next` for Next.js builds
- Includes Python API support for Flask backend
- Configured for production environment

### Next.js Configuration (`next.config.mjs`)
- App directory enabled
- TypeScript and ESLint errors ignored during build
- Images unoptimized for better performance
- Standalone output for Vercel

### File Structure
```
├── app/                    # Next.js app directory (copied from src/app/)
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # UI components
├── lib/                   # Utility libraries
├── public/                # Static assets
├── vercel.json           # Vercel configuration
├── next.config.mjs       # Next.js configuration
└── .vercelignore         # Deployment exclusions
```

## Environment Variables

Make sure to set these environment variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

If you encounter issues:
1. Check that all dependencies are in `package.json`
2. Ensure the `app/` directory contains all necessary pages
3. Verify environment variables are set in Vercel dashboard
4. Check build logs in Vercel dashboard for specific errors
