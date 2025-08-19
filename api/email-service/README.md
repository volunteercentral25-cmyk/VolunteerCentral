# Email Verification Service

This Flask-based email service handles volunteer hours verification workflows for the CATA Volunteer Central platform.

## Features

- **Email Verification**: Sends verification emails to supervisors/organizations
- **Secure Tokens**: HMAC-based verification tokens with 7-day expiration
- **Approval/Denial Workflow**: Complete approval and denial process
- **Email Templates**: Beautiful HTML email templates
- **Database Integration**: Full integration with Supabase database
- **Email Logging**: Comprehensive email logging for audit trails

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  Flask Email     │    │   Supabase      │
│                 │    │  Service         │    │   Database      │
│ - Hours Logging │───▶│ - Email Sending  │───▶│ - volunteer_hours│
│ - Verification  │    │ - Token Gen      │    │ - profiles      │
│   UI            │    │ - Status Updates │    │ - email_logs    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## API Endpoints

### 1. Health Check
```
GET /health
```
Returns service health status.

### 2. Send Verification Email
```
POST /send-verification-email
```
Sends verification email to supervisor/organization.

**Request Body:**
```json
{
  "hours_id": "uuid",
  "verifier_email": "supervisor@organization.com",
  "student_id": "uuid"
}
```

### 3. Verify Hours
```
GET /verify-hours?token=xxx&action=approve&hours_id=xxx&email=xxx
```
Handles hours verification (approve/deny).

**Query Parameters:**
- `token`: HMAC verification token
- `action`: "approve" or "deny"
- `hours_id`: Hours record ID
- `email`: Verifier email
- `notes`: Optional denial notes

### 4. Send Notification
```
POST /send-notification
```
Sends notification email to student about hours status.

**Request Body:**
```json
{
  "hours_id": "uuid",
  "student_email": "student@email.com",
  "status": "approved|denied",
  "verifier_email": "supervisor@organization.com",
  "notes": "Optional notes"
}
```

## Email Templates

### 1. Verification Request Email
- Professional HTML template
- Student and hours details
- Approve/Deny buttons
- 7-day expiration notice

### 2. Approval Confirmation Email
- Success confirmation
- Approved details
- Thank you message

### 3. Denial Confirmation Email
- Denial confirmation
- Denied details with optional notes
- Professional closure

## Security Features

### Token Generation
```python
def generate_verification_token(hours_id: str, action: str, verifier_email: str) -> str:
    timestamp = str(int(datetime.utcnow().timestamp()))
    message = f"{hours_id}:{action}:{verifier_email}:{timestamp}"
    signature = hmac.new(
        SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{timestamp}:{signature}"
```

### Token Verification
- HMAC signature verification
- 7-day expiration check
- Secure comparison using `hmac.compare_digest()`

## Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SMTP Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Application Configuration
FRONTEND_URL=http://localhost:3000
SECRET_KEY=your_secret_key_here
```

## Database Schema

### volunteer_hours Table
```sql
ALTER TABLE volunteer_hours 
ADD COLUMN verification_email TEXT,
ADD COLUMN verified_by TEXT,
ADD COLUMN verification_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN verification_notes TEXT;
```

### email_logs Table
```sql
CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT,
  data JSONB,
  status TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error TEXT
);
```

## Deployment

### Local Development
```bash
cd api/email-service
pip install -r requirements.txt
python flask_app.py
```

### Vercel Deployment
1. Deploy to Vercel using the `vercel.json` configuration
2. Set environment variables in Vercel dashboard
3. The service will be available at your Vercel domain

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "flask_app:app"]
```

## Integration with Next.js

### Proxy API Route
The Next.js app includes a proxy route at `/api/email-service/[...path]` that forwards requests to the Flask service.

### Usage in Hours API
```typescript
// Send verification email when hours are logged
const emailResponse = await fetch(`${process.env.EMAIL_SERVICE_URL}/send-verification-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hours_id: newHour.id,
    verifier_email: verification_email,
    student_id: profile.id
  }),
})
```

## Email Workflow

### 1. Hours Logging
1. Student logs volunteer hours with verification email
2. System validates email domain (organizational only)
3. Hours are saved with "pending" status
4. Verification email is sent to supervisor

### 2. Email Verification
1. Supervisor receives email with verification links
2. Clicks approve or deny button
3. System validates token and updates hours status
4. Confirmation email sent to supervisor
5. Notification email sent to student

### 3. Status Tracking
- **Pending**: Hours logged, awaiting verification
- **Approved**: Hours verified and approved
- **Denied**: Hours denied with optional notes

## Error Handling

### Email Failures
- Failed emails are logged with error details
- System continues to function even if emails fail
- Retry mechanisms can be implemented

### Token Expiration
- Tokens expire after 7 days
- Expired tokens show appropriate error message
- New verification emails can be sent

### Database Errors
- Comprehensive error logging
- Graceful degradation
- User-friendly error messages

## Monitoring and Logging

### Email Logs
All emails are logged to the `email_logs` table with:
- Recipient email
- Template used
- Subject line
- Data sent
- Status (sent/failed)
- Timestamp
- Error details (if any)

### Application Logs
- Request/response logging
- Error tracking
- Performance monitoring

## Security Considerations

### Email Security
- SMTP over TLS
- App passwords for Gmail
- Rate limiting (can be implemented)

### Token Security
- HMAC-based signatures
- Short expiration times
- Secure comparison functions

### Database Security
- Row Level Security (RLS) policies
- Service role key for admin operations
- Input validation and sanitization

## Future Enhancements

### 1. Advanced Features
- Email templates customization
- Bulk verification workflows
- Advanced reporting and analytics

### 2. Integration Features
- Webhook notifications
- API rate limiting
- Caching layer

### 3. Monitoring Features
- Email delivery tracking
- Performance metrics
- Alert system for failures

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check SMTP credentials
   - Verify email service is running
   - Check email logs for errors

2. **Token Verification Failing**
   - Verify SECRET_KEY is set correctly
   - Check token expiration
   - Validate token format

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network connectivity
   - Validate table schema

### Debug Mode
Enable debug logging by setting:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Support

For issues and questions:
1. Check the logs for error details
2. Verify environment variables
3. Test email service connectivity
4. Review database schema and permissions
