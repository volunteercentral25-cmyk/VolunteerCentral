#!/usr/bin/env python3
"""
Simple test to verify Flask Mail service with new templates
"""

import os
import sys

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from flask_app import TemplateService
    
    print("Testing Flask Mail Template Service")
    print("=" * 40)
    
    # Initialize template service
    template_service = TemplateService()
    
    # Test loading a template
    print("Testing template loading...")
    template_content = template_service.load_template('hours_approved')
    
    if template_content:
        print(f"✅ Template loaded successfully ({len(template_content)} characters)")
        
        # Test rendering with sample data
        print("\nTesting template rendering...")
        sample_data = {
            'student_name': 'John Doe',
            'opportunity_title': 'Community Service',
            'volunteer_date': '2024-01-15',
            'hours_logged': 3,
            'description': 'Helped clean up the park',
            'approved_by': 'Admin User',
            'approved_date': '2024-01-16 10:30 AM',
            'total_hours': 15,
            'logo_url': 'https://example.com/logo.png',
            'dashboard_url': 'https://example.com/dashboard'
        }
        
        rendered = template_service.render_template('hours_approved', **sample_data)
        
        if rendered and '{{' not in rendered:
            print("✅ Template rendered successfully")
            print("✅ Flask Mail service is ready to use new templates!")
        else:
            print("❌ Template contains unrendered variables")
            
    else:
        print("❌ Failed to load template")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
