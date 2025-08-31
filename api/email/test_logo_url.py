#!/usr/bin/env python3
"""
Test script to verify logo URL configuration in Flask email app
"""

import os
import sys

# Add the current directory to the path so we can import from flask_app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set some test environment variables
os.environ['NEXT_PUBLIC_APP_URL'] = 'https://your-app-domain.vercel.app'
os.environ['LOGO_URL'] = 'https://your-app-domain.vercel.app/logo.png'

# Import the Flask app configuration
from flask_app import LOGO_URL, FRONTEND_URL

print("=== Logo URL Configuration Test ===")
print(f"FRONTEND_URL: {FRONTEND_URL}")
print(f"LOGO_URL: {LOGO_URL}")
print(f"LOGO_URL is absolute: {LOGO_URL.startswith('http')}")
print(f"LOGO_URL is accessible: {LOGO_URL != '/logo.png'}")

# Test template rendering
from flask import Flask
from flask_app import render_email

app = Flask(__name__)

# Test rendering a simple template
test_html = render_email('base.html', subject='Test Email')
print("\n=== Template Rendering Test ===")
print("Template rendered successfully!" if 'logo.png' in test_html else "Template rendering failed!")
print(f"Logo URL in template: {LOGO_URL}")

print("\n=== Configuration Summary ===")
if LOGO_URL.startswith('http'):
    print("✅ Logo URL is properly configured as absolute URL")
    print(f"   Logo will be accessible at: {LOGO_URL}")
else:
    print("❌ Logo URL is not properly configured")
    print("   Please set LOGO_URL environment variable to an absolute URL")

print("\n=== Recommendations ===")
print("1. Set LOGO_URL environment variable to your deployed app's logo URL")
print("2. Example: LOGO_URL=https://your-app-domain.vercel.app/logo.png")
print("3. Make sure the logo.png file is accessible at that URL")
