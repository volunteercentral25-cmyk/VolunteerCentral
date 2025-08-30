// Test script to verify Flask Mail service is working
const FLASK_URL = 'https://volunteer-central-flax.vercel.app/api/email'

async function testFlaskMail() {
  console.log('🧪 Testing Flask Mail Service...')
  
  try {
    // Test 1: Health check
    console.log('\n📋 Test 1: Health Check')
    const healthResponse = await fetch(`${FLASK_URL}/health`)
    console.log('Status:', healthResponse.status)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('✅ Health check passed!')
      console.log('Mail configured:', healthData.mail_configured)
      console.log('Supabase configured:', healthData.supabase_configured)
      console.log('Mail config:', healthData.mail_config)
    } else {
      console.log('❌ Health check failed')
      return
    }
    
    // Test 2: Test sending actual email
    console.log('\n📧 Test 2: Test Email Send')
    const testEmailResponse = await fetch(`${FLASK_URL}/test-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'yatish@logicrefine.com'
      })
    })
    
    console.log('Status:', testEmailResponse.status)
    
    if (testEmailResponse.ok) {
      const result = await testEmailResponse.json()
      console.log('✅ Test email sent successfully!')
      console.log('Result:', result)
    } else {
      const errorText = await testEmailResponse.text()
      console.log('❌ Test email failed:', errorText)
    }
    
    // Test 3: Test hours notification endpoint
    console.log('\n🔔 Test 3: Hours Notification Endpoint')
    const hoursResponse = await fetch(`${FLASK_URL}/send-hours-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        hours_id: 'test-id',
        student_email: 'yatish@logicrefine.com',
        status: 'approved',
        admin_id: 'test-admin',
        notes: 'Test approval from script'
      })
    })
    
    console.log('Status:', hoursResponse.status)
    
    if (hoursResponse.ok) {
      const result = await hoursResponse.json()
      console.log('✅ Hours notification test passed!')
      console.log('Result:', result)
    } else {
      const errorText = await hoursResponse.text()
      console.log('❌ Hours notification test failed:', errorText)
    }
    
  } catch (error) {
    console.log('💥 Error testing Flask Mail:', error.message)
  }
}

testFlaskMail()
