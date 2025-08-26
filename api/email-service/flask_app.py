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

# Initialize services
email_service = EmailService()
supabase_service = SupabaseService()

# Email templates
VERIFICATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Volunteer Hours Verification Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .hours-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .button.approve { background: #28a745; }
        .button.deny { background: #dc3545; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .student-info { background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Volunteer Hours Verification</h1>
            <p>volunteer</p>
        </div>
        
        <div class="content">
            <h2>Hello!</h2>
            <p>A student has submitted volunteer hours for your verification. Please review the details below and approve or deny the submission.</p>
            
            <div class="student-info">
                <h3>Student Information</h3>
                <p><strong>Name:</strong> {{ student_name }}</p>
                <p><strong>Email:</strong> {{ student_email }}</p>
                <p><strong>Student ID:</strong> {{ student_id }}</p>
            </div>
            
            <div class="hours-details">
                <h3>Volunteer Hours Details</h3>
                <p><strong>Activity:</strong> {{ activity }}</p>
                <p><strong>Hours:</strong> {{ hours }}</p>
                <p><strong>Date:</strong> {{ date }}</p>
                <p><strong>Description:</strong> {{ description }}</p>
                <p><strong>Submitted:</strong> {{ submitted_date }}</p>
            </div>
            
            <p>Please click one of the buttons below to approve or deny these volunteer hours:</p>
            
            <div style="text-align: center;">
                <a href="{{ approve_url }}" class="button approve">✓ Approve Hours</a>
                <a href="{{ deny_url }}" class="button deny">✗ Deny Hours</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>Note:</strong> This verification link will expire in 7 days. If you have any questions, please contact the volunteer team.
            </p>
        </div>
        
        <div class="footer">
            <p>volunteer - Building Community Through Service</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
"""

APPROVAL_CONFIRMATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hours Approved</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✓</div>
            <h1>Hours Approved Successfully</h1>
        </div>
        
        <div class="content">
            <h2>Thank you for your verification!</h2>
            <p>The volunteer hours have been approved and the student has been notified.</p>
            
            <h3>Approved Details:</h3>
            <ul>
                <li><strong>Student:</strong> {{ student_name }}</li>
                <li><strong>Activity:</strong> {{ activity }}</li>
                <li><strong>Hours:</strong> {{ hours }}</li>
                <li><strong>Date:</strong> {{ date }}</li>
                <li><strong>Approved by:</strong> {{ verifier_email }}</li>
                <li><strong>Approved on:</strong> {{ approval_date }}</li>
            </ul>
            
            <p>Thank you for supporting our volunteer program!</p>
        </div>
        
        <div class="footer">
            <p>volunteer - Building Community Through Service</p>
        </div>
    </div>
</body>
</html>
"""

DENIAL_CONFIRMATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hours Denied</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .denial-icon { font-size: 48px; margin-bottom: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="denial-icon">✗</div>
            <h1>Hours Denied</h1>
        </div>
        
        <div class="content">
            <h2>Verification Complete</h2>
            <p>The volunteer hours have been denied and the student has been notified.</p>
            
            <h3>Denied Details:</h3>
            <ul>
                <li><strong>Student:</strong> {{ student_name }}</li>
                <li><strong>Activity:</strong> {{ activity }}</li>
                <li><strong>Hours:</strong> {{ hours }}</li>
                <li><strong>Date:</strong> {{ date }}</li>
                <li><strong>Denied by:</strong> {{ verifier_email }}</li>
                <li><strong>Denied on:</strong> {{ denial_date }}</li>
                {% if notes %}
                <li><strong>Reason:</strong> {{ notes }}</li>
                {% endif %}
            </ul>
            
            <p>Thank you for your time and attention to this matter.</p>
        </div>
        
        <div class="footer">
            <p>volunteer - Building Community Through Service</p>
        </div>
    </div>
</body>
</html>
"""

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
        
        # Render email template
        html_content = render_template_string(VERIFICATION_EMAIL_TEMPLATE, **template_data)
        text_content = f"""
Volunteer Hours Verification Request

A student has submitted volunteer hours for your verification.

Student: {template_data['student_name']} ({template_data['student_email']})
Activity: {template_data['activity']}
Hours: {template_data['hours']}
Date: {template_data['date']}
Description: {template_data['description']}

To approve: {approve_url}
To deny: {deny_url}

This link will expire in 7 days.
        """
        
        # Send email
        subject = f"Volunteer Hours Verification Request - {template_data['student_name']}"
        success = email_service.send_email(verifier_email, subject, html_content, text_content)
        
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
        
        # Send confirmation email to verifier
        if action == 'approve':
            html_content = render_template_string(APPROVAL_CONFIRMATION_TEMPLATE, **template_data)
            subject = f"Hours Approved - {template_data['student_name']}"
        else:
            html_content = render_template_string(DENIAL_CONFIRMATION_TEMPLATE, **template_data)
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
        
        # Prepare email content based on status
        if status == 'approved':
            subject = "Your Volunteer Hours Have Been Approved!"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">✓ Hours Approved!</h2>
                <p>Great news! Your volunteer hours have been approved.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Approved Details:</h3>
                    <p><strong>Activity:</strong> {hours_data.get('description', 'Volunteer Activity')}</p>
                    <p><strong>Hours:</strong> {hours_data.get('hours', 0)}</p>
                    <p><strong>Date:</strong> {hours_data.get('date', 'Unknown')}</p>
                    <p><strong>Approved by:</strong> {verifier_email}</p>
                    <p><strong>Approved on:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</p>
                </div>
                
                <p>Thank you for your volunteer service!</p>
            </div>
            """
        else:
            subject = "Volunteer Hours Update"
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">Hours Status Update</h2>
                <p>Your volunteer hours have been reviewed.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3>Details:</h3>
                    <p><strong>Activity:</strong> {hours_data.get('description', 'Volunteer Activity')}</p>
                    <p><strong>Hours:</strong> {hours_data.get('hours', 0)}</p>
                    <p><strong>Date:</strong> {hours_data.get('date', 'Unknown')}</p>
                    <p><strong>Status:</strong> {status.title()}</p>
                    <p><strong>Reviewed by:</strong> {verifier_email}</p>
                    {f'<p><strong>Notes:</strong> {notes}</p>' if notes else ''}
                </div>
                
                <p>If you have any questions, please contact the organization directly.</p>
            </div>
            """
        
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

if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))
