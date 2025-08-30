from flask import Flask, request, jsonify, render_template, render_template_string
from flask_mail import Mail, Message
from flask_cors import CORS
import os
import uuid
import requests
import hashlib
import hmac
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from premailer import transform

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration - Using exact Vercel environment variable names
app.config['MAIL_SERVER'] = os.getenv('FLASK_MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('FLASK_MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('FLASK_MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('FLASK_MAIL_USERNAME', 'CLTVolunteerCentral@gmail.com')
app.config['MAIL_PASSWORD'] = os.getenv('FLASK_MAIL_PASSWORD', 'jnkb gfpz qxjz nflx')
app.config['MAIL_DEFAULT_SENDER'] = (os.getenv('FLASK_MAIL_USERNAME', 'CLTVolunteerCentral@gmail.com'), os.getenv('FLASK_MAIL_DISPLAY_NAME', 'volunteer'))
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
FRONTEND_URL = os.getenv('NEXT_PUBLIC_APP_URL', 'https://volunteercentral25-cmyk.vercel.app')
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

mail = Mail(app)

# Template rendering with CSS inlining
def render_email(template_name: str, **context) -> str:
    try:
        html = render_template(template_name, **context)
    except Exception:
        # Fallback to string template rendering if file not found
        html = render_template_string(template_name, **context)
    # Inline CSS for email client compatibility
    try:
        return transform(html, remove_classes=False)
    except Exception:
        return html

class SupabaseService:
    def __init__(self):
        self.url = SUPABASE_URL
        self.service_key = SUPABASE_SERVICE_KEY
        self.headers = {
            'apikey': self.service_key,
            'Authorization': f'Bearer {self.service_key}',
            'Content-Type': 'application/json'
        }
    
    def get_hours_by_id(self, hours_id: str) -> Optional[Dict[str, Any]]:
        """Get volunteer hours by ID"""
        try:
            response = requests.get(
                f"{self.url}/rest/v1/volunteer_hours?id=eq.{hours_id}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data[0] if data else None
        except Exception as e:
            logger.error(f"Failed to get hours: {str(e)}")
            return None
    
    def update_hours_status(self, hours_id: str, status: str, verified_by: str, notes: str = None) -> bool:
        """Update volunteer hours status"""
        try:
            update_data = {
                'status': status,
                'verified_by': verified_by,
                'verification_date': datetime.utcnow().isoformat(),
                'verification_notes': notes,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            response = requests.patch(
                f"{self.url}/rest/v1/volunteer_hours?id=eq.{hours_id}",
                headers=self.headers,
                json=update_data
            )
            response.raise_for_status()
            
            logger.info(f"Hours {hours_id} status updated to {status}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update hours status: {str(e)}")
            return False
    
    def get_student_profile(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Get student profile by ID"""
        try:
            response = requests.get(
                f"{self.url}/rest/v1/profiles?id=eq.{student_id}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data[0] if data else None
        except Exception as e:
            logger.error(f"Failed to get student profile: {str(e)}")
            return None
    
    def log_email_sent(self, recipient: str, template: str, subject: str, data: Dict[str, Any]) -> bool:
        """Log email sent to database"""
        try:
            log_data = {
                'recipient': recipient,
                'template': template,
                'subject': subject,
                'data': json.dumps(data),
                'status': 'sent',
                'sent_at': datetime.utcnow().isoformat()
            }
            
            response = requests.post(
                f"{self.url}/rest/v1/email_logs",
                headers=self.headers,
                json=log_data
            )
            response.raise_for_status()
            return True
            
        except Exception as e:
            logger.error(f"Failed to log email: {str(e)}")
            return False
    
    def get_admin_profile(self, admin_id: str) -> Optional[Dict[str, Any]]:
        """Get admin profile by ID"""
        try:
            response = requests.get(
                f"{self.url}/rest/v1/profiles?id=eq.{admin_id}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data[0] if data else None
        except Exception as e:
            logger.error(f"Failed to get admin profile: {str(e)}")
            return None
    
    def log_admin_activity(self, admin_id: str, action: str, details: Dict[str, Any]) -> bool:
        """Log admin activity"""
        try:
            log_data = {
                'admin_id': admin_id,
                'action': action,
                'details': json.dumps(details),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            response = requests.post(
                f"{self.url}/rest/v1/admin_activity_logs",
                headers=self.headers,
                json=log_data
            )
            response.raise_for_status()
            return True
            
        except Exception as e:
            logger.error(f"Failed to log admin activity: {str(e)}")
            return False

# Initialize services
supabase_service = SupabaseService()

def generate_verification_token(hours_id: str, action: str, verifier_email: str) -> str:
    """Generate HMAC verification token"""
    timestamp = str(int(datetime.utcnow().timestamp()))
    message = f"{hours_id}:{action}:{verifier_email}:{timestamp}"
    signature = hmac.new(
        SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{timestamp}:{signature}"

def verify_token(token: str, hours_id: str, action: str, verifier_email: str) -> bool:
    """Verify HMAC token"""
    try:
        timestamp, signature = token.split(':')
        message = f"{hours_id}:{action}:{verifier_email}:{timestamp}"
        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Check if token is expired (7 days)
        token_time = datetime.fromtimestamp(int(timestamp))
        if datetime.utcnow() - token_time > timedelta(days=7):
            return False
        
        return hmac.compare_digest(signature, expected_signature)
    except:
        return False

@app.route('/api/email/send-verification-email', methods=['POST'])
def send_verification_email():
    """Send verification email to supervisor/organization"""
    try:
        logger.info("Received verification email request")
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        # Validate required fields
        required_fields = ['hours_id', 'verifier_email', 'student_id']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        hours_id = data['hours_id']
        verifier_email = data['verifier_email']
        student_id = data['student_id']
        
        logger.info(f"Processing verification email for hours_id: {hours_id}, verifier: {verifier_email}, student: {student_id}")
        
        # Get hours details from database
        hours_data = supabase_service.get_hours_by_id(hours_id)
        if not hours_data:
            return jsonify({'error': 'Hours record not found'}), 404
        
        # Get student profile
        student_profile = supabase_service.get_student_profile(student_id)
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        # Generate verification URLs
        approve_token = generate_verification_token(hours_id, 'approve', verifier_email)
        deny_token = generate_verification_token(hours_id, 'deny', verifier_email)
        
        approve_url = f"{FRONTEND_URL}/verify-hours?token={approve_token}&action=approve&hours_id={hours_id}&email={verifier_email}"
        deny_url = f"{FRONTEND_URL}/verify-hours?token={deny_token}&action=deny&hours_id={hours_id}&email={verifier_email}"
        
        # Prepare email content
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'student_email': student_profile.get('email', 'Unknown'),
            'student_id': student_profile.get('student_id', 'Unknown'),
            'activity': hours_data.get('description', 'Volunteer Activity'),
            'hours': hours_data.get('hours', 0),
            'date': hours_data.get('date', 'Unknown'),
            'description': hours_data.get('description', 'No description provided'),
            'submitted_date': hours_data.get('created_at', 'Unknown'),
            'approve_url': approve_url,
            'deny_url': deny_url
        }
        
        # Render email template via Jinja file and inline CSS
        html_content = render_email(
            'verification_request.html',
            **template_data
        )
        
        # Send email using Flask-Mail
        logger.info(f"Preparing to send email to: {verifier_email}")
        
        subject = f"Volunteer Hours Verification Request - {template_data['student_name']}"
        
        msg = Message(
            subject,
            sender=app.config['MAIL_USERNAME'],
            recipients=[verifier_email]
        )
        msg.html = html_content
        
        mail.send(msg)
        logger.info("Email sent successfully!")
        
        # Log email sent
        supabase_service.log_email_sent(
            recipient=verifier_email,
            template='verification_request',
            subject=subject,
            data=template_data
        )
        
        return jsonify({
            'success': True,
            'message': 'Verification email sent successfully',
            'hours_id': hours_id,
            'verifier_email': verifier_email
        })
        
    except Exception as e:
        logger.error(f"Error sending verification email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/verify-hours', methods=['GET'])
def verify_hours():
    """Handle hours verification (approve/deny) from email link"""
    try:
        token = request.args.get('token')
        action = request.args.get('action')
        hours_id = request.args.get('hours_id')
        verifier_email = request.args.get('email')

        if not all([token, action, hours_id, verifier_email]):
            return jsonify({'error': 'Missing required parameters'}), 400

        if not verify_token(token, hours_id, action, verifier_email):
            return jsonify({'error': 'Invalid or expired verification token'}), 400

        # Get hours data
        hours_data = supabase_service.get_hours_by_id(hours_id)
        if not hours_data:
            return jsonify({'error': 'Hours record not found'}), 404

        # Get student profile
        student_profile = supabase_service.get_student_profile(hours_data['student_id'])
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404

        # Update status
        status = 'approved' if action == 'approve' else 'denied'
        notes = request.args.get('notes', '')
        updated = supabase_service.update_hours_status(hours_id, status, verifier_email, notes)
        if not updated:
            return jsonify({'error': 'Failed to update hours status'}), 500

        # Optionally send confirmation email to verifier (non-blocking best-effort)
        try:
            if status == 'approved':
                subject = f"Hours Approved — {student_profile.get('full_name','Student')}"
                html_conf = render_email(
                    'approval.html',
                    student_name=student_profile.get('full_name','Unknown'),
                    activity=hours_data.get('description',''),
                    hours=hours_data.get('hours',0),
                    date=hours_data.get('date',''),
                    verifier_email=verifier_email,
                    approval_date=datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
                )
            else:
                subject = f"Hours Denied — {student_profile.get('full_name','Student')}"
                html_conf = render_email(
                    'denial.html',
                    student_name=student_profile.get('full_name','Unknown'),
                    activity=hours_data.get('description',''),
                    hours=hours_data.get('hours',0),
                    date=hours_data.get('date',''),
                    verifier_email=verifier_email,
                    denial_date=datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
                    notes=notes
                )

            msg = Message(
                subject,
                sender=app.config['MAIL_USERNAME'],
                recipients=[verifier_email]
            )
            msg.html = html_conf
            mail.send(msg)
        except Exception as e:
            logger.warning(f"Failed to send confirmation email: {str(e)}")

        # Notify student (best-effort)
        try:
            student_email = student_profile.get('email')
            if student_email:
                subject_s = f"Your Volunteer Hours Were {status.title()}"
                html_s = render_email(
                    'student_notification.html',
                    student_name=student_profile.get('full_name','Student'),
                    activity=hours_data.get('description',''),
                    hours=hours_data.get('hours',0),
                    date=hours_data.get('date',''),
                    status=status,
                    verifier_email=verifier_email,
                    notes=notes
                )
                msg = Message(
                    subject_s,
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[student_email]
                )
                msg.html = html_s
                mail.send(msg)
        except Exception as e:
            logger.warning(f"Failed to notify student: {str(e)}")

        return jsonify({
            'success': True,
            'message': f"Hours {status} successfully",
            'hours_id': hours_id,
            'status': status,
            'verifier_email': verifier_email
        }), 200

    except Exception as e:
        logger.error(f"Error verifying hours: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/test', methods=['GET'])
def test_email_service():
    """Test endpoint to verify email service is working"""
    try:
        # Test Supabase connection
        if SUPABASE_URL and SUPABASE_SERVICE_KEY:
            supabase_status = "✅ configured"
            try:
                # Test actual connection
                response = requests.get(
                    f"{SUPABASE_URL}/rest/v1/",
                    headers={'apikey': SUPABASE_SERVICE_KEY},
                    timeout=5
                )
                if response.status_code in [200, 400]:  # 400 is expected for root endpoint
                    supabase_connection = "✅ connected"
                else:
                    supabase_connection = f"❌ connection failed ({response.status_code})"
            except Exception as e:
                supabase_connection = f"❌ connection error: {str(e)}"
        else:
            supabase_status = "❌ not configured"
            supabase_connection = "❌ no credentials"
        
        # Test Flask-Mail configuration
        mail_config = {
            'server': app.config['MAIL_SERVER'],
            'port': app.config['MAIL_PORT'],
            'username': app.config['MAIL_USERNAME'],
            'password_set': '✅ yes' if app.config['MAIL_PASSWORD'] and app.config['MAIL_PASSWORD'] != 'your_app_password' else '❌ no'
        }
        
        # Environment variable check
        env_vars = {
            'FLASK_MAIL_SERVER': '✅ set' if os.getenv('FLASK_MAIL_SERVER') else '❌ not set',
            'FLASK_MAIL_PORT': '✅ set' if os.getenv('FLASK_MAIL_PORT') else '❌ not set',
            'FLASK_MAIL_USERNAME': '✅ set' if os.getenv('FLASK_MAIL_USERNAME') else '❌ not set',
            'FLASK_MAIL_PASSWORD': '✅ set' if os.getenv('FLASK_MAIL_PASSWORD') else '❌ not set',
            'FLASK_MAIL_DISPLAY_NAME': '✅ set' if os.getenv('FLASK_MAIL_DISPLAY_NAME') else '❌ not set',
            'NEXT_PUBLIC_APP_URL': '✅ set' if os.getenv('NEXT_PUBLIC_APP_URL') else '❌ not set',
            'SUPABASE_URL': '✅ set' if os.getenv('SUPABASE_URL') else '❌ not set',
            'SUPABASE_SERVICE_ROLE_KEY': '✅ set' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else '❌ not set',
            'SECRET_KEY': '✅ set' if os.getenv('SECRET_KEY') else '❌ not set'
        }
        
        return jsonify({
            'status': 'Flask-Mail Email Service Diagnostics',
            'mail': {
                'configuration': mail_config
            },
            'environment_variables': env_vars,
            'supabase': {
                'status': supabase_status,
                'connection': supabase_connection
            },
            'frontend_url': FRONTEND_URL,
            'timestamp': datetime.utcnow().isoformat(),
            'ready_to_send_emails': mail_config['password_set'] == '✅ yes' and supabase_status == '✅ configured'
        }), 200
    except Exception as e:
        logger.error(f"Test endpoint error: {str(e)}")
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/email/test-send', methods=['POST'])
def test_send_email():
    """Test endpoint to actually send a test email"""
    try:
        data = request.get_json()
        test_email = data.get('email')
        
        if not test_email:
            return jsonify({'error': 'Email address is required'}), 400
        
        # Create test email content
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>✅ Email Service Test</h1>
                <p>volunteer</p>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <h2>Success! 🎉</h2>
                <p>This email confirms that the Flask-Mail email service is working properly.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Configuration Details:</h3>
                    <ul>
                        <li><strong>Server:</strong> {app.config['MAIL_SERVER']}</li>
                        <li><strong>Port:</strong> {app.config['MAIL_PORT']}</li>
                        <li><strong>From:</strong> {app.config['MAIL_USERNAME']}</li>
                    </ul>
                </div>
                
                <p>Your volunteer hours verification emails will now be sent successfully!</p>
            </div>
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                <p>volunteer - Email Service Test</p>
                <p>Timestamp: {datetime.utcnow().isoformat()}</p>
            </div>
        </div>
        """
        
        # Send the email using Flask-Mail
        msg = Message(
            'volunteer - Email Service Test',
            sender=app.config['MAIL_USERNAME'],
            recipients=[test_email]
        )
        msg.html = html_content
        
        mail.send(msg)
        logger.info(f"Test email sent successfully to {test_email}")
        
        return jsonify({
            'success': True,
            'message': 'Test email sent successfully!',
            'recipient': test_email,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to send test email: {str(e)}")
        return jsonify({
            'error': f'Failed to send test email: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@app.route('/api/email/opportunity-confirmation', methods=['POST'])
def opportunity_confirmation():
    try:
        data = request.get_json()
        student_email = data.get('student_email')
        student_name = data.get('student_name', 'Student')
        title = data.get('title')
        organization = data.get('organization', 'Community Organization')
        location = data.get('location', 'TBD')
        date = data.get('date', '')
        time = data.get('time', '')
        duration = data.get('duration', '')

        if not (student_email and title):
            return jsonify({'error': 'Missing required fields'}), 400

        html = render_email('opportunity_confirmation.html',
            student_name=student_name,
            title=title,
            organization=organization,
            location=location,
            date=date,
            time=time,
            duration=duration
        )
        
        msg = Message(
            f'You are registered: {title}',
            sender=app.config['MAIL_USERNAME'],
            recipients=[student_email]
        )
        msg.html = html
        
        mail.send(msg)
        return jsonify({'success': True})
            
    except Exception as e:
        logger.error(f"Opportunity confirmation error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/opportunity-reminder', methods=['POST'])
def opportunity_reminder():
    try:
        data = request.get_json()
        student_email = data.get('student_email')
        student_name = data.get('student_name', 'Student')
        title = data.get('title')
        organization = data.get('organization', 'Community Organization')
        location = data.get('location', 'TBD')
        date = data.get('date', '')
        time = data.get('time', '')
        duration = data.get('duration', '')

        if not (student_email and title):
            return jsonify({'error': 'Missing required fields'}), 400

        html = render_email('opportunity_reminder.html',
            student_name=student_name,
            title=title,
            organization=organization,
            location=location,
            date=date,
            time=time,
            duration=duration
        )
        
        msg = Message(
            f'Reminder: {title} is coming up',
            sender=app.config['MAIL_USERNAME'],
            recipients=[student_email]
        )
        msg.html = html
        
        mail.send(msg)
        return jsonify({'success': True})
            
    except Exception as e:
        logger.error(f"Opportunity reminder error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/opportunity-cancellation', methods=['POST'])
def opportunity_cancellation():
    try:
        data = request.get_json()
        student_email = data.get('student_email')
        student_name = data.get('student_name', 'Student')
        title = data.get('title')
        organization = data.get('organization', 'Community Organization')
        location = data.get('location', 'TBD')
        date = data.get('date', '')
        time = data.get('time', '')
        duration = data.get('duration', '')

        if not (student_email and title):
            return jsonify({'error': 'Missing required fields'}), 400

        html = render_email('opportunity_cancellation.html',
            student_name=student_name,
            title=title,
            organization=organization,
            location=location,
            date=date,
            time=time,
            duration=duration
        )
        
        msg = Message(
            f'Registration cancelled: {title}',
            sender=app.config['MAIL_USERNAME'],
            recipients=[student_email]
        )
        msg.html = html
        
        mail.send(msg)
        return jsonify({'success': True})
            
    except Exception as e:
        logger.error(f"Opportunity cancellation error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/hours-update-notification', methods=['POST'])
def hours_update_notification():
    """Send notification email when hours are updated by admin"""
    try:
        logger.info("Received hours update notification request")
        data = request.get_json()
        logger.info(f"Request data: {data}")
        
        # Validate required fields
        required_fields = ['hours_id', 'verifier_email', 'status']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        hours_id = data['hours_id']
        verifier_email = data['verifier_email']
        status = data['status']
        notes = data.get('notes', '')
        admin_email = data.get('admin_email', 'Admin')
        
        logger.info(f"Processing hours update notification for hours_id: {hours_id}, status: {status}")
        
        # Get hours details from database
        hours_data = supabase_service.get_hours_by_id(hours_id)
        if not hours_data:
            return jsonify({'error': 'Hours record not found'}), 404
        
        # Get student profile
        student_profile = supabase_service.get_student_profile(hours_data['student_id'])
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        # Prepare email content based on status
        if status == 'approved':
            subject = f"Volunteer Hours Approved - {student_profile.get('full_name', 'Student')}"
            template_name = 'approval.html'
            preheader = f"The volunteer hours for {student_profile.get('full_name', 'Student')} have been approved"
        else:
            subject = f"Volunteer Hours Denied - {student_profile.get('full_name', 'Student')}"
            template_name = 'denial.html'
            preheader = f"The volunteer hours for {student_profile.get('full_name', 'Student')} have been denied"
        
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'student_email': student_profile.get('email', 'Unknown'),
            'student_id': student_profile.get('student_id', 'Unknown'),
            'activity': hours_data.get('description', 'Volunteer Activity'),
            'hours': hours_data.get('hours', 0),
            'date': hours_data.get('date', 'Unknown'),
            'description': hours_data.get('description', 'No description provided'),
            'status': status,
            'notes': notes,
            'admin_email': admin_email,
            'verifier_email': verifier_email,
            'approval_date' if status == 'approved' else 'denial_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
        }
        
        # Render email template
        html_content = render_email(
            template_name,
            subject=subject,
            preheader=preheader,
            **template_data
        )
        
        # Send email to verifier
        logger.info(f"Preparing to send notification email to: {verifier_email}")
        
        msg = Message(
            subject,
            sender=app.config['MAIL_USERNAME'],
            recipients=[verifier_email]
        )
        msg.html = html_content
        
        logger.info("Sending notification email...")
        mail.send(msg)
        logger.info("Notification email sent successfully!")
        
        # Also notify the student about the update
        try:
            student_email = student_profile.get('email')
            if student_email:
                student_subject = f"Your Volunteer Hours Were {status.title()}"
                student_html = render_email(
                    'student_notification.html',
                    subject=student_subject,
                    preheader=f"Your volunteer hours have been {status}",
                    student_name=student_profile.get('full_name', 'Student'),
                    activity=hours_data.get('description', ''),
                    hours=hours_data.get('hours', 0),
                    date=hours_data.get('date', ''),
                    status=status,
                    verifier_email=verifier_email,
                    notes=notes
                )
                student_msg = Message(
                    student_subject,
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[student_email]
                )
                student_msg.html = student_html
                mail.send(student_msg)
                logger.info(f"Student notification sent to: {student_email}")
        except Exception as e:
            logger.warning(f"Failed to notify student: {str(e)}")
        
        # Log email sent
        supabase_service.log_email_sent(
            recipient=verifier_email,
            template=template_name,
            subject=subject,
            data=template_data
        )
        
        return jsonify({
            'success': True,
            'message': 'Hours update notification sent successfully',
            'hours_id': hours_id,
            'verifier_email': verifier_email,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error sending hours update notification: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/send-hours-notification', methods=['POST'])
def send_hours_notification():
    """Send notification email when admin approves/denies hours"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['hours_id', 'student_email', 'status', 'admin_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        hours_id = data['hours_id']
        student_email = data['student_email']
        status = data['status']
        admin_id = data['admin_id']
        notes = data.get('notes', '')
        
        # Get hours data
        hours_data = supabase_service.get_hours_by_id(hours_id)
        if not hours_data:
            return jsonify({'error': 'Hours record not found'}), 404
        
        # Get student profile
        student_profile = supabase_service.get_student_profile(hours_data['student_id'])
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        # Get admin profile
        admin_profile = supabase_service.get_admin_profile(admin_id)
        if not admin_profile:
            return jsonify({'error': 'Admin profile not found'}), 404
        
        # Calculate total hours (this should be calculated from database)
        total_hours = hours_data.get('hours', 0)  # This should be sum of all approved hours
        
        # Prepare email content
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'activity': hours_data.get('description', 'Volunteer Activity'),
            'hours': hours_data.get('hours', 0),
            'date': hours_data.get('date', 'Unknown'),
            'description': hours_data.get('description', 'No description provided'),
            'admin_name': admin_profile.get('full_name', 'Admin'),
            'verification_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
            'notes': notes,
            'total_hours': total_hours
        }
        
        if status == 'approved':
            template_name = 'hours_approved.html'
            subject = f"Your Volunteer Hours Have Been Approved! - {template_data['student_name']}"
        else:
            template_name = 'hours_denied.html'
            subject = f"Volunteer Hours Update - {template_data['student_name']}"
        
        # Render email template
        html_content = render_email(template_name, **template_data)
        
        # Send email
        msg = Message(
            subject,
            sender=app.config['MAIL_USERNAME'],
            recipients=[student_email]
        )
        msg.html = html_content
        
        mail.send(msg)
        
        # Log email sent
        supabase_service.log_email_sent(
            recipient=student_email,
            template=f'hours_{status}',
            subject=subject,
            data=template_data
        )
        
        # Log admin activity
        supabase_service.log_admin_activity(
            admin_id=admin_id,
            action=f'hours_{status}',
            details={
                'hours_id': hours_id,
                'student_id': hours_data['student_id'],
                'student_email': student_email,
                'notes': notes
            }
        )
        
        return jsonify({
            'success': True,
            'message': f'Hours {status} notification sent',
            'student_email': student_email,
            'status': status
        })
        
    except Exception as e:
        logger.error(f"Error sending hours notification: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'service': 'volunteer Email Service',
        'timestamp': datetime.utcnow().isoformat(),
        'supabase_configured': bool(SUPABASE_URL and SUPABASE_SERVICE_KEY),
        'mail_configured': bool(app.config['MAIL_USERNAME'] and app.config['MAIL_PASSWORD']),
        'mail_config': {
            'server': app.config.get('MAIL_SERVER'),
            'port': app.config.get('MAIL_PORT'),
            'username': app.config.get('MAIL_USERNAME'),
            'password_set': bool(app.config.get('MAIL_PASSWORD')),
            'use_tls': app.config.get('MAIL_USE_TLS')
        },
        'env_vars': {
            'FLASK_MAIL_SERVER': os.getenv('FLASK_MAIL_SERVER'),
            'FLASK_MAIL_PORT': os.getenv('FLASK_MAIL_PORT'),
            'FLASK_MAIL_USERNAME': os.getenv('FLASK_MAIL_USERNAME'),
            'FLASK_MAIL_PASSWORD': '***set***' if os.getenv('FLASK_MAIL_PASSWORD') else 'not set'
        }
    }), 200

@app.route('/', methods=['GET'])
def root():
    """Root endpoint for debugging"""
    return jsonify({
        'message': 'Flask Mail Service is running!',
        'service': 'volunteer Email Service',
        'timestamp': datetime.utcnow().isoformat(),
        'available_endpoints': [
            '/api/email/health',
            '/api/email/send-hours-notification',
            '/api/email/send-verification-email',
            '/api/email/test',
            '/api/email/test-send'
        ]
    }), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
