#!/usr/bin/env python3
"""
Test script to verify email templates are loading correctly
"""

import os
import sys

# Add the current directory to the path so we can import from flask_app
sys.path.append(os.path.dirname(__file__))

from flask_app import TemplateService

def test_template_loading():
    """Test that all templates can be loaded"""
    template_service = TemplateService()
    
    # List of templates we expect to exist
    expected_templates = [
        'verification_request',
        'approval',
        'denial',
        'hours_approved',
        'hours_denied',
        'opportunity_registration',
        'opportunity_reminder',
        'opportunity_unregistration',
        'student_notification',
        'opportunity_confirmation',
        'opportunity_cancellation'
    ]
    
    print("Testing template loading...")
    print("=" * 50)
    
    success_count = 0
    total_count = len(expected_templates)
    
    for template_name in expected_templates:
        try:
            template_content = template_service.load_template(template_name)
            if template_content:
                print(f"✅ {template_name} - Loaded successfully ({len(template_content)} characters)")
                success_count += 1
            else:
                print(f"❌ {template_name} - Empty content")
        except Exception as e:
            print(f"❌ {template_name} - Error: {str(e)}")
    
    print("=" * 50)
    print(f"Results: {success_count}/{total_count} templates loaded successfully")
    
    if success_count == total_count:
        print("🎉 All templates loaded successfully!")
        return True
    else:
        print("⚠️  Some templates failed to load")
        return False

def test_template_rendering():
    """Test that templates can be rendered with sample data"""
    template_service = TemplateService()
    
    # Sample data for testing
    sample_data = {
        'student_name': 'John Doe',
        'student_email': 'john.doe@example.com',
        'opportunity_title': 'Community Garden Cleanup',
        'opportunity_date': '2024-01-15',
        'opportunity_time': '10:00 AM',
        'opportunity_location': 'Central Park',
        'hours': 3,
        'activity': 'Volunteer Service',
        'description': 'Helped clean up the community garden',
        'verifier_email': 'supervisor@example.com',
        'admin_name': 'Admin User',
        'notes': 'Great work!',
        'total_hours': 15,
        'days_until': 3,
        'registration_status': 'Confirmed',
        'dashboard_url': 'http://localhost:3000/student/opportunities',
        'view_details_url': 'http://localhost:3000/student/opportunities',
        'unregister_url': 'http://localhost:3000/student/opportunities/unregister/123'
    }
    
    print("\nTesting template rendering...")
    print("=" * 50)
    
    # Test a few key templates
    test_templates = [
        'opportunity_registration',
        'hours_approved',
        'verification_request'
    ]
    
    success_count = 0
    total_count = len(test_templates)
    
    for template_name in test_templates:
        try:
            rendered_content = template_service.render_template(template_name, **sample_data)
            if rendered_content and '{{' not in rendered_content:
                print(f"✅ {template_name} - Rendered successfully")
                success_count += 1
            else:
                print(f"❌ {template_name} - Contains unrendered variables")
        except Exception as e:
            print(f"❌ {template_name} - Error: {str(e)}")
    
    print("=" * 50)
    print(f"Results: {success_count}/{total_count} templates rendered successfully")
    
    if success_count == total_count:
        print("🎉 All templates rendered successfully!")
        return True
    else:
        print("⚠️  Some templates failed to render")
        return False

if __name__ == '__main__':
    print("Email Template Test Suite")
    print("=" * 50)
    
    # Test template loading
    loading_success = test_template_loading()
    
    # Test template rendering
    rendering_success = test_template_rendering()
    
    print("\n" + "=" * 50)
    if loading_success and rendering_success:
        print("🎉 All tests passed! Templates are ready to use.")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the template files.")
        sys.exit(1)
