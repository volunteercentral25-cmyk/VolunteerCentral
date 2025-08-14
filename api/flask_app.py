from flask import Flask, request, jsonify, render_template_string
from flask_mail import Mail, Message
from flask_cors import CORS
import os
import uuid
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# Configuration
app.config['MAIL_SERVER'] = os.getenv('FLASK_MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('FLASK_MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('FLASK_MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('FLASK_MAIL_USERNAME', 'your_email@cata-volunteer.org')
app.config['MAIL_PASSWORD'] = os.getenv('FLASK_MAIL_PASSWORD', 'your_app_password')
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key')

mail = Mail(app)

# Email templates
VERIFICATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CATA Volunteer - Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CATA Volunteer</h1>
            <p>Email Verification</p>
        </div>
        <div class="content">
            <h2>Welcome to CATA Volunteer!</h2>
            <p>Thank you for registering with CATA Volunteer. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="{{ verification_url }}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p>{{ verification_url }}</p>
            <p>This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 CATA Volunteer. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

OVERRIDE_REQUEST_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CATA Volunteer - Hours Override Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CATA Volunteer</h1>
            <p>Hours Override Request</p>
        </div>
        <div class="content">
            <h2>Volunteer Hours Override Request</h2>
            <p>A student has requested approval for volunteer hours that were not part of a registered opportunity.</p>
            
            <div class="details">
                <h3>Request Details:</h3>
                <p><strong>Student Name:</strong> {{ student_name }}</p>
                <p><strong>Event Location:</strong> {{ event_location }}</p>
                <p><strong>Event Name:</strong> {{ event_name }}</p>
                <p><strong>Hours:</strong> {{ hours }}</p>
                <p><strong>Description:</strong> {{ description }}</p>
            </div>
            
            <p>Please review this request and click the button below to approve or deny:</p>
            <a href="{{ approval_url }}" class="button">Review Request</a>
        </div>
        <div class="footer">
            <p>&copy; 2024 CATA Volunteer. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

@app.route('/api/email/verification', methods=['POST'])
def send_verification_email():
    try:
        data = request.get_json()
        email = data.get('email')
        token = data.get('token')
        
        if not email or not token:
            return jsonify({'error': 'Email and token are required'}), 400
        
        verification_url = f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/verify-email?token={token}"
        
        msg = Message(
            'Verify Your Email - CATA Volunteer',
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        
        msg.html = render_template_string(VERIFICATION_EMAIL_TEMPLATE, verification_url=verification_url)
        
        mail.send(msg)
        
        return jsonify({'message': 'Verification email sent successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/email/override-request', methods=['POST'])
def send_override_request():
    try:
        data = request.get_json()
        admin_email = data.get('admin_email')
        student_name = data.get('student_name')
        event_location = data.get('event_location')
        event_name = data.get('event_name')
        hours = data.get('hours')
        description = data.get('description')
        token = data.get('token')
        
        if not all([admin_email, student_name, event_location, event_name, hours, description, token]):
            return jsonify({'error': 'All fields are required'}), 400
        
        approval_url = f"{os.getenv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')}/admin/hours/override?token={token}"
        
        msg = Message(
            'Volunteer Hours Override Request - CATA Volunteer',
            sender=app.config['MAIL_USERNAME'],
            recipients=[admin_email]
        )
        
        msg.html = render_template_string(
            OVERRIDE_REQUEST_TEMPLATE,
            student_name=student_name,
            event_location=event_location,
            event_name=event_name,
            hours=hours,
            description=description,
            approval_url=approval_url
        )
        
        mail.send(msg)
        
        return jsonify({'message': 'Override request email sent successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/email/notification', methods=['POST'])
def send_notification():
    try:
        data = request.get_json()
        email = data.get('email')
        subject = data.get('subject')
        message = data.get('message')
        
        if not all([email, subject, message]):
            return jsonify({'error': 'Email, subject, and message are required'}), 400
        
        msg = Message(
            subject,
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        
        msg.html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>CATA Volunteer</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                {message}
            </div>
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
                <p>&copy; 2024 CATA Volunteer. All rights reserved.</p>
            </div>
        </div>
        """
        
        mail.send(msg)
        
        return jsonify({'message': 'Notification email sent successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'CATA Volunteer Email Service'}), 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
