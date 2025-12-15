# Resend Setup Guide

## Quick Setup Instructions

### 1. Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key
1. Log into Resend dashboard
2. Go to "API Keys" section
3. Click "Create API Key"
4. Give it a name (e.g., "BONDS Production")
5. Copy the generated API key

### 3. Update Environment Variables
Replace the placeholder in your `.env` file:

```env
# Replace this line:
RESEND_API_KEY=your-resend-api-key-here

# With your actual API key:
RESEND_API_KEY=re_your_actual_api_key_here
```

### 4. Test the Integration
Run the test script to verify everything works:

```bash
npm run test-resend
```

### 5. Domain Verification (Production)
For production use, verify your domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `bonds.app`)
4. Add the provided DNS records to your domain
5. Wait for verification (usually a few minutes)

Once verified, update your `EMAIL_FROM` in `.env`:
```env
EMAIL_FROM=noreply@yourdomain.com
```

## Free Tier Limits
- **100 emails/day** for free accounts
- **3,000 emails/month** for free accounts
- No credit card required for free tier

## Troubleshooting

### Common Issues

#### 1. "API key not configured"
- Make sure `RESEND_API_KEY` is set in `.env`
- Restart your server after updating `.env`
- Check for typos in the API key

#### 2. "Unauthorized" errors
- Verify your API key is correct
- Make sure you copied the full key from Resend dashboard
- Check if the API key has expired

#### 3. Emails not being delivered
- Check Resend dashboard for delivery status
- Verify the recipient email address
- Check spam/junk folders
- For production, make sure domain is verified

#### 4. "Domain not verified" (Production)
- Add DNS records provided by Resend
- Wait for DNS propagation (can take up to 24 hours)
- Use a subdomain if main domain verification fails

### Testing Tips

1. **Development**: Use any email address for testing
2. **Production**: Only use verified domains
3. **Monitoring**: Check Resend dashboard for delivery statistics
4. **Debugging**: Enable detailed logging in development

## Migration Verification

After setup, verify the migration was successful:

1. ✅ Nodemailer package removed
2. ✅ Resend package installed
3. ✅ Environment variables updated
4. ✅ Old email files deleted
5. ✅ New EmailService working
6. ✅ OTP emails sending successfully

## Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **API Reference**: [resend.com/docs/api-reference](https://resend.com/docs/api-reference)
- **Status Page**: [status.resend.com](https://status.resend.com)

## Next Steps

1. Set up your Resend API key
2. Test email delivery
3. Verify domain for production
4. Monitor email delivery rates
5. Consider upgrading plan if needed