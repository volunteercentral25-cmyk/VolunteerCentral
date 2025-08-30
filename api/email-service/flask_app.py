from flask import Flask, request, jsonify, render_template_string
import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import uuid
import json
import requests
from datetime import datetime, timedelta
import logging
from typing import Dict, Any, Optional
import hashlib
import hmac

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD')
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
SECRET_KEY = os.getenv('SECRET_KEY', 'c057f320112909a9eedff367f37a554c65ab7363cccb2f6366d5c1606446938d')

# Email templates directory
TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'email', 'templates')

class EmailService:
    def __init__(self):
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        self.username = SMTP_USERNAME
        self.password = SMTP_PASSWORD
        
    def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email using SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.username
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=ssl.create_default_context())
                server.login(self.username, self.password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

class TemplateService:
    def __init__(self):
        self.templates_dir = TEMPLATES_DIR
        
    def load_template(self, template_name: str) -> str:
        """Load HTML template from file"""
        try:
            template_path = os.path.join(self.templates_dir, f"{template_name}.html")
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to load template {template_name}: {str(e)}")
            return ""
    
    def render_template(self, template_name: str, **kwargs) -> str:
        """Load and render template with variables"""
        template_content = self.load_template(template_name)
        if template_content:
            # Simple template rendering without Flask context
            try:
                return render_template_string(template_content, **kwargs)
            except RuntimeError:
                # Fallback to simple string replacement for testing
                rendered = template_content
                for key, value in kwargs.items():
                    rendered = rendered.replace(f'{{{{ {key} }}}}', str(value))
                    rendered = rendered.replace(f'{{{{{key}}}}}', str(value))
                return rendered
        return ""

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
    
    def get_opportunity_by_id(self, opportunity_id: str) -> Optional[Dict[str, Any]]:
        """Get opportunity by ID"""
        try:
            response = requests.get(
                f"{self.url}/rest/v1/opportunities?id=eq.{opportunity_id}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data[0] if data else None
        except Exception as e:
            logger.error(f"Failed to get opportunity: {str(e)}")
            return None
    
    def get_registration_by_id(self, registration_id: str) -> Optional[Dict[str, Any]]:
        """Get registration by ID"""
        try:
            response = requests.get(
                f"{self.url}/rest/v1/opportunity_registrations?id=eq.{registration_id}",
                headers=self.headers
            )
            response.raise_for_status()
            data = response.json()
            return data[0] if data else None
        except Exception as e:
            logger.error(f"Failed to get registration: {str(e)}")
            return None
    
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
email_service = EmailService()
template_service = TemplateService()
supabase_service = SupabaseService()

def generate_verification_token(hours_id: str, action: str, verifier_email: str) -> str:
    """Generate a secure verification token"""
    timestamp = str(int(datetime.utcnow().timestamp()))
    message = f"{hours_id}:{action}:{verifier_email}:{timestamp}"
    signature = hmac.new(
        SECRET_KEY.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"{timestamp}:{signature}"

def verify_token(token: str, hours_id: str, action: str, verifier_email: str) -> bool:
    """Verify the token is valid and not expired"""
    try:
        timestamp_str, signature = token.split(':', 1)
        timestamp = int(timestamp_str)
        
        # Check if token is expired (7 days)
        if datetime.utcnow().timestamp() - timestamp > 7 * 24 * 60 * 60:
            return False
        
        # Verify signature
        message = f"{hours_id}:{action}:{verifier_email}:{timestamp_str}"
        expected_signature = hmac.new(
            SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
        
    except Exception:
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'service': 'email-verification-service'
    })

@app.route('/send-verification-email', methods=['POST'])
def send_verification_email():
    """Send verification email to supervisor/organization"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['hours_id', 'verifier_email', 'student_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        hours_id = data['hours_id']
        verifier_email = data['verifier_email']
        student_id = data['student_id']
        
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
        
        # Render email template using new template
        html_content = template_service.render_template('verification_request', **template_data)
        
        # Send email
        subject = f"Volunteer Hours Verification Request - {template_data['student_name']}"
        success = email_service.send_email(verifier_email, subject, html_content)
        
        if success:
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
        else:
            return jsonify({'error': 'Failed to send verification email'}), 500
            
    except Exception as e:
        logger.error(f"Error sending verification email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/verify-hours', methods=['GET'])
def verify_hours():
    """Handle hours verification (approve/deny)"""
    try:
        # Get parameters from URL
        token = request.args.get('token')
        action = request.args.get('action')
        hours_id = request.args.get('hours_id')
        verifier_email = request.args.get('email')
        
        if not all([token, action, hours_id, verifier_email]):
            return jsonify({'error': 'Missing required parameters'}), 400
        
        # Verify token
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
        
        # Update hours status
        status = 'approved' if action == 'approve' else 'denied'
        notes = request.args.get('notes', '')
        
        success = supabase_service.update_hours_status(hours_id, status, verifier_email, notes)
        if not success:
            return jsonify({'error': 'Failed to update hours status'}), 500
        
        # Prepare confirmation email data
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'activity': hours_data.get('description', 'Volunteer Activity'),
            'hours': hours_data.get('hours', 0),
            'date': hours_data.get('date', 'Unknown'),
            'verifier_email': verifier_email,
            'approval_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
            'denial_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
            'notes': notes
        }
        
        # Send confirmation email to verifier using new templates
        if action == 'approve':
            html_content = template_service.render_template('approval', **template_data)
            subject = f"Hours Approved - {template_data['student_name']}"
        else:
            html_content = template_service.render_template('denial', **template_data)
            subject = f"Hours Denied - {template_data['student_name']}"
        
        email_service.send_email(verifier_email, subject, html_content)
        
        # Log the verification
        supabase_service.log_email_sent(
            recipient=verifier_email,
            template=f'hours_{action}',
            subject=subject,
            data=template_data
        )
        
        return jsonify({
            'success': True,
            'message': f'Hours {action} successfully',
            'hours_id': hours_id,
            'status': status,
            'verifier_email': verifier_email
        })
        
    except Exception as e:
        logger.error(f"Error verifying hours: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/send-notification', methods=['POST'])
def send_notification():
    """Send notification email to student about hours status"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['hours_id', 'student_email', 'status']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        hours_id = data['hours_id']
        student_email = data['student_email']
        status = data['status']
        verifier_email = data.get('verifier_email', 'Unknown')
        notes = data.get('notes', '')
        
        # Get hours data
        hours_data = supabase_service.get_hours_by_id(hours_id)
        if not hours_data:
            return jsonify({'error': 'Hours record not found'}), 404
        
        # Get student profile
        student_profile = supabase_service.get_student_profile(hours_data['student_id'])
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        # Prepare email content using new templates
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'activity': hours_data.get('description', 'Volunteer Activity'),
            'hours': hours_data.get('hours', 0),
            'date': hours_data.get('date', 'Unknown'),
            'description': hours_data.get('description', 'No description provided'),
            'verifier_email': verifier_email,
            'verification_date': datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC'),
            'notes': notes,
            'total_hours': hours_data.get('hours', 0)  # This should be calculated from total
        }
        
        if status == 'approved':
            html_content = template_service.render_template('hours_approved', **template_data)
            subject = f"Your Volunteer Hours Have Been Approved! - {template_data['student_name']}"
        else:
            html_content = template_service.render_template('hours_denied', **template_data)
            subject = f"Volunteer Hours Update - {template_data['student_name']}"
        
        # Send email
        success = email_service.send_email(student_email, subject, html_content)
        
        if success:
            # Log email sent
            supabase_service.log_email_sent(
                recipient=student_email,
                template=f'student_{status}_notification',
                subject=subject,
                data={
                    'hours_id': hours_id,
                    'status': status,
                    'verifier_email': verifier_email,
                    'notes': notes
                }
            )
            
            return jsonify({
                'success': True,
                'message': f'Notification email sent to student',
                'student_email': student_email,
                'status': status
            })
        else:
            return jsonify({'error': 'Failed to send notification email'}), 500
            
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/send-opportunity-registration', methods=['POST'])
def send_opportunity_registration():
    """Send confirmation email for opportunity registration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['registration_id', 'student_email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        registration_id = data['registration_id']
        student_email = data['student_email']
        
        # Get registration details
        registration = supabase_service.get_registration_by_id(registration_id)
        if not registration:
            return jsonify({'error': 'Registration not found'}), 404
        
        # Get opportunity details
        opportunity = supabase_service.get_opportunity_by_id(registration['opportunity_id'])
        if not opportunity:
            return jsonify({'error': 'Opportunity not found'}), 404
        
        # Get student profile
        student_profile = supabase_service.get_student_profile(registration['student_id'])
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        # Prepare email content
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'opportunity_title': opportunity.get('title', 'Volunteer Opportunity'),
            'opportunity_date': opportunity.get('date', 'TBD'),
            'opportunity_time': opportunity.get('time', 'TBD'),
            'opportunity_location': opportunity.get('location', 'TBD'),
            'opportunity_requirements': opportunity.get('requirements', 'None'),
            'registration_status': 'Confirmed',
            'dashboard_url': f"{FRONTEND_URL}/student/opportunities"
        }
        
        # Render and send email
        html_content = template_service.render_template('opportunity_registration', **template_data)
        subject = f"Registration Confirmed - {template_data['opportunity_title']}"
        
        success = email_service.send_email(student_email, subject, html_content)
        
        if success:
            # Log email sent
            supabase_service.log_email_sent(
                recipient=student_email,
                template='opportunity_registration',
                subject=subject,
                data=template_data
            )
            
            return jsonify({
                'success': True,
                'message': 'Registration confirmation email sent',
                'student_email': student_email,
                'opportunity_title': template_data['opportunity_title']
            })
        else:
            return jsonify({'error': 'Failed to send registration email'}), 500
            
    except Exception as e:
        logger.error(f"Error sending opportunity registration email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/send-opportunity-reminder', methods=['POST'])
def send_opportunity_reminder():
    """Send reminder email for upcoming opportunity"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['registration_id', 'student_email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        registration_id = data['registration_id']
        student_email = data['student_email']
        
        # Get registration details
        registration = supabase_service.get_registration_by_id(registration_id)
        if not registration:
            return jsonify({'error': 'Registration not found'}), 404
        
        # Get opportunity details
        opportunity = supabase_service.get_opportunity_by_id(registration['opportunity_id'])
        if not opportunity:
            return jsonify({'error': 'Opportunity not found'}), 404
        
        # Get student profile
        student_profile = supabase_service.get_student_profile(registration['student_id'])
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        # Calculate days until opportunity
        opportunity_date = datetime.strptime(opportunity['date'], '%Y-%m-%d')
        days_until = (opportunity_date - datetime.now()).days
        
        # Prepare email content
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'opportunity_title': opportunity.get('title', 'Volunteer Opportunity'),
            'opportunity_date': opportunity.get('date', 'TBD'),
            'opportunity_time': opportunity.get('time', 'TBD'),
            'opportunity_location': opportunity.get('location', 'TBD'),
            'opportunity_requirements': opportunity.get('requirements', 'None'),
            'days_until': days_until,
            'view_details_url': f"{FRONTEND_URL}/student/opportunities",
            'unregister_url': f"{FRONTEND_URL}/student/opportunities/unregister/{registration_id}"
        }
        
        # Render and send email
        html_content = template_service.render_template('opportunity_reminder', **template_data)
        subject = f"Reminder: {template_data['opportunity_title']} in {days_until} days"
        
        success = email_service.send_email(student_email, subject, html_content)
        
        if success:
            # Log email sent
            supabase_service.log_email_sent(
                recipient=student_email,
                template='opportunity_reminder',
                subject=subject,
                data=template_data
            )
            
            return jsonify({
                'success': True,
                'message': 'Reminder email sent',
                'student_email': student_email,
                'opportunity_title': template_data['opportunity_title'],
                'days_until': days_until
            })
        else:
            return jsonify({'error': 'Failed to send reminder email'}), 500
            
    except Exception as e:
        logger.error(f"Error sending opportunity reminder email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/send-opportunity-unregistration', methods=['POST'])
def send_opportunity_unregistration():
    """Send confirmation email for opportunity unregistration"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['registration_id', 'student_email']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        registration_id = data['registration_id']
        student_email = data['student_email']
        
        # Get registration details
        registration = supabase_service.get_registration_by_id(registration_id)
        if not registration:
            return jsonify({'error': 'Registration not found'}), 404
        
        # Get opportunity details
        opportunity = supabase_service.get_opportunity_by_id(registration['opportunity_id'])
        if not opportunity:
            return jsonify({'error': 'Opportunity not found'}), 404
        
        # Get student profile
        student_profile = supabase_service.get_student_profile(registration['student_id'])
        if not student_profile:
            return jsonify({'error': 'Student profile not found'}), 404
        
        # Prepare email content
        template_data = {
            'student_name': student_profile.get('full_name', 'Unknown'),
            'opportunity_title': opportunity.get('title', 'Volunteer Opportunity'),
            'opportunity_date': opportunity.get('date', 'TBD'),
            'opportunity_time': opportunity.get('time', 'TBD'),
            'opportunity_location': opportunity.get('location', 'TBD'),
            'dashboard_url': f"{FRONTEND_URL}/student/opportunities"
        }
        
        # Render and send email
        html_content = template_service.render_template('opportunity_unregistration', **template_data)
        subject = f"Unregistration Confirmed - {template_data['opportunity_title']}"
        
        success = email_service.send_email(student_email, subject, html_content)
        
        if success:
            # Log email sent
            supabase_service.log_email_sent(
                recipient=student_email,
                template='opportunity_unregistration',
                subject=subject,
                data=template_data
            )
            
            return jsonify({
                'success': True,
                'message': 'Unregistration confirmation email sent',
                'student_email': student_email,
                'opportunity_title': template_data['opportunity_title']
            })
        else:
            return jsonify({'error': 'Failed to send unregistration email'}), 500
            
    except Exception as e:
        logger.error(f"Error sending opportunity unregistration email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/send-hours-notification', methods=['POST'])
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
            html_content = template_service.render_template('hours_approved', **template_data)
            subject = f"Your Volunteer Hours Have Been Approved! - {template_data['student_name']}"
        else:
            html_content = template_service.render_template('hours_denied', **template_data)
            subject = f"Volunteer Hours Update - {template_data['student_name']}"
        
        # Send email
        success = email_service.send_email(student_email, subject, html_content)
        
        if success:
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
        else:
            return jsonify({'error': 'Failed to send hours notification email'}), 500
            
    except Exception as e:
        logger.error(f"Error sending hours notification: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
