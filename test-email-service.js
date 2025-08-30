// Test script to check Flask Mail service
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'https://volunteercentral25-cmyk.vercel.app/api/email'

async function testEmailService() {
  console.log('Testing Flask Mail service at:', EMAIL_SERVICE_URL)
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${EMAIL_SERVICE_URL}/health`)
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Health check passed:', healthData)
    } else {
      console.log('❌ Health check failed:', healthResponse.status)
      return
    }
    
    // Test hours notification endpoint
    const testData = {
      hours_id: 'test-123',
      student_email: 'test@example.com',
      status: 'approved',
      admin_id: 'admin-123',
      notes: 'Test approval'
    }
    
    console.log('Testing hours notification endpoint...')
    const notificationResponse = await fetch(`${EMAIL_SERVICE_URL}/send-hours-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    })
    
    if (notificationResponse.ok) {
      const result = await notificationResponse.json()
      console.log('✅ Hours notification test passed:', result)
    } else {
      const errorText = await notificationResponse.text()
      console.log('❌ Hours notification test failed:', notificationResponse.status, errorText)
    }
    
  } catch (error) {
    console.log('❌ Error testing email service:', error.message)
  }
}

testEmailService()
