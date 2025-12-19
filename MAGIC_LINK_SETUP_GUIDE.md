# Magic Link Authentication - Setup Guide

## 🚀 Quick Start

Your Magic Link authentication system is **COMPLETE** and ready to use! Here's how to get it running:

## 1. Email Service Setup (Required for Production)

### Get Resend API Key
1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain (or use their test domain for development)
3. Get your API key from the dashboard
4. Update your `.env` file:

```env
RESEND_API_KEY=re_your_actual_api_key_here
```

### Current Status
- ✅ Magic Link system is fully implemented
- ✅ Fallback mechanism shows links in console when email fails
- ⚠️ Email delivery requires valid Resend API key

## 2. Test the System

### Backend Testing
```bash
cd backend
node test-magic-link-system.js
```

### Frontend Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:5173/register`
4. Try the signup flow
5. Check console logs for magic links (when email fails)

## 3. Magic Link URLs

When emails can't be sent, the system logs magic links like this:

```
🔍 FALLBACK - Magic Link Details for Testing:
📧 Email: te***@example.com
🔗 Magic Link: https://bonds-one.vercel.app/verify?token=abc123...
👤 User: Test User
📝 Type: signup
💡 Use this link if email delivery fails
```

You can copy these links and test them directly in your browser!

## 4. Available Flows

### Signup Flow
1. Go to `/register`
2. Fill out the form
3. Click "Continue"
4. Check email (or console logs)
5. Click magic link to complete registration

### Password Reset Flow
1. Go to `/forgot-password`
2. Enter your email
3. Check email (or console logs)
4. Click magic link to reset password

### Passwordless Login
- Use the API endpoint `POST /auth/magic-login` with just an email
- Perfect for mobile apps or one-click login

## 5. Production Deployment

### Vercel Deployment
Your system is **100% Vercel compatible**:
- ✅ Uses Resend (serverless-friendly)
- ✅ No SMTP connections
- ✅ Stateless verification
- ✅ Proper error handling

### Environment Variables for Production
```env
NODE_ENV=production
RESEND_API_KEY=re_your_production_api_key
CLIENT_URL=https://your-production-domain.com
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
```

## 6. Security Features

Your implementation includes:
- 🔒 Cryptographically secure tokens
- 🔒 Hashed token storage
- 🔒 10-minute expiration
- 🔒 Single-use tokens
- 🔒 Rate limiting (3 per 5 minutes)
- 🔒 IP tracking
- 🔒 HTTPS-only links

## 7. API Endpoints

### New Magic Link Endpoints
- `POST /auth/signup` - Send signup magic link
- `POST /auth/verify-magic-link` - Verify and create account
- `POST /auth/magic-login` - Passwordless login
- `POST /auth/forgot-password` - Send reset link
- `POST /auth/verify-reset-link` - Verify reset link
- `POST /auth/reset-password` - Reset password

### Existing Endpoints (Still Work)
- `POST /auth/login` - Traditional login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

## 8. Troubleshooting

### Email Not Sending
- Check your Resend API key
- Verify your domain in Resend
- Look for magic links in console logs

### Magic Link Not Working
- Check the link hasn't expired (10 minutes)
- Ensure it hasn't been used already
- Verify CLIENT_URL matches your frontend domain

### Rate Limiting
- Wait 5 minutes between requests
- Each email can only request 3 magic links per 5-minute window

## 9. Next Steps

1. **Get Resend API Key** - For email delivery
2. **Test All Flows** - Signup, login, password reset
3. **Deploy to Production** - Everything is ready!
4. **Monitor Usage** - Check magic link stats

## 🎉 You're All Set!

Your Magic Link authentication system is **production-ready**. The only thing needed is a Resend API key for email delivery. Until then, you can test using the console-logged magic links.

**Happy coding! 🚀**