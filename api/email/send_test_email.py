#!/usr/bin/env python3
"""
Script to send a test email and verify logo configuration
"""

import requests
import json
import time

def test_email_service():
    """Test the email service endpoints"""
    
    base_url = "http://localhost:5000"
    
    print("=== Testing Email Service ===")
    
    # Test 1: Health check
    print("\n1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/api/email/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Health check passed!")
            print(f"   Logo URL: {health_data.get('logo_url', 'Not found')}")
            print(f"   Logo URL is absolute: {health_data.get('logo_url_is_absolute', False)}")
            print(f"   Mail configured: {health_data.get('mail_configured', False)}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        return False
    
    # Test 2: Send test email
    print("\n2. Testing email sending...")
    
    # You can change this email address to your own
    test_email = input("Enter your email address to receive the test email: ").strip()
    
    if not test_email:
        print("❌ No email address provided")
        return False
    
    try:
        email_data = {"email": test_email}
        response = requests.post(
            f"{base_url}/api/email/test-send", 
            json=email_data, 
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Test email sent successfully!")
            print(f"   Recipient: {result.get('recipient')}")
            print(f"   Timestamp: {result.get('timestamp')}")
            print("\n📧 Check your email inbox for the test message!")
            print("   The email should include the logo image if configured correctly.")
        else:
            print(f"❌ Test email failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test email error: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    print("Email Service Test Script")
    print("Make sure the Flask app is running on http://localhost:5000")
    print()
    
    success = test_email_service()
    
    if success:
        print("\n🎉 All tests passed! The logo should be visible in your email.")
    else:
        print("\n❌ Some tests failed. Check the Flask app configuration.")
    
    print("\n=== Configuration Summary ===")
    print("If the logo doesn't appear in the email:")
    print("1. Make sure your app is deployed and accessible")
    print("2. Set LOGO_URL environment variable to your deployed app's logo URL")
    print("3. Example: LOGO_URL=https://your-app-domain.vercel.app/logo.png")
    print("4. Ensure the logo.png file is in your public/ directory")
