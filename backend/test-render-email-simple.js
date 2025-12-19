require('dotenv').config();

async function testSimpleEmail() {
  console.log('🧪 Simple Email Test for Render\n');
  
  try {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('📧 Attempting to send test email...');
    
    const result = await resend.emails.send({
      from: 'BONDS <onboarding@resend.dev>',
      to: 'test@example.com',
      subject: 'BONDS Test Email',
      text: 'This is a test email from BONDS app to verify Resend integration.',
      html: `
        <h2>🎉 BONDS Test Email</h2>
        <p>This is a test email from your BONDS app.</p>
        <p>If you're seeing this, your Resend integration is working!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.id);
    console.log('📧 Result:', result);
    
    return true;
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('📋 Error details:', error);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 API Key Issue:');
      console.log('- Check if RESEND_API_KEY is set correctly');
      console.log('- Verify the API key in Resend dashboard');
      console.log('- Make sure there are no extra spaces');
    }
    
    if (error.message.includes('domain')) {
      console.log('\n💡 Domain Issue:');
      console.log('- The from domain needs to be verified in Resend');
      console.log('- Use onboarding@resend.dev for testing');
      console.log('- Add your own domain in Resend dashboard for production');
    }
    
    return false;
  }
}

testSimpleEmail();