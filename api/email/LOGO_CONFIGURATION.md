# Logo Configuration for Email Templates

## Problem
The logo image wasn't loading in Flask mail templates because it was using a relative path (`/logo.png`) instead of an absolute URL.

## Solution
The Flask app has been updated to use absolute URLs for the logo in email templates.

## Configuration

### Environment Variables
Set the following environment variables in your deployment:

```bash
# Your app's base URL (e.g., your Vercel deployment)
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app

# Optional: Override the logo URL if you want to use a different URL
LOGO_URL=https://your-app-domain.vercel.app/logo.png
```

### How it works
1. If `LOGO_URL` is set, it will use that value
2. If `LOGO_URL` is not set, it will use `{FRONTEND_URL}/logo.png`
3. The `FRONTEND_URL` defaults to `http://localhost:3000` if `NEXT_PUBLIC_APP_URL` is not set

### Logo File Location
Make sure your `logo.png` file is accessible at the configured URL. For Vercel deployments:
- Place the logo in the `public/` directory
- It will be accessible at `https://your-app-domain.vercel.app/logo.png`

## Testing
Run the test script to verify configuration:

```bash
cd api/email
python test_logo_url.py
```

## Email Templates
All email templates now use `{{logo_url}}` variable which will be automatically populated with the correct absolute URL.

### Templates using the logo:
- `base.html` - Base template with logo in header
- `hours_approved.html` - Hours approval notification
- `hours_denied.html` - Hours denial notification  
- `opportunity_registration.html` - Opportunity registration confirmation
- `opportunity_reminder.html` - Opportunity reminder
- `opportunity_unregistration.html` - Opportunity unregistration
- `verification_request.html` - Hours verification request

## Example Logo URL
Based on the image description, your logo should be a vibrant 3D logo with:
- Heart shape with purple/pink gradient
- Hand element in deep red
- Bright green orb accent
- Black background
- 3D glossy appearance

Make sure this logo file is accessible at your configured `LOGO_URL`.
