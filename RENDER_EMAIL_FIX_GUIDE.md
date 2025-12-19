# Render Email Fix Guide 📧

## 🚨 Issue: Email Delivery Failing on Render

You're seeing this error because the Resend email service isn't working properly in your Render deployment.

## 🔍 Common Causes

### 1. **Environment Variables Not Set**
- RESEND_API_KEY not configured in Render
- API key contains placeholder text
- Trailing spaces in environment variables

### 2. **Domain Not Verified**
- Using unverified domain in `fromEmail`
- Domain verification pending in Resend

### 3. **API Key Issues**
- Invalid or expired API key
- Wrong API key format
- API key permissions

## 🛠️ Step-by-Step Fix

### Step 1: Check Render Environment Variables

1. Go to your Render dashboard
2. Navigate to your backend service
3. Go to **Environment** tab
4. Verify these variables exist:

```
RESEND_API_KEY=re_your_actual_api_key_here
CLIENT_URL=https://your-frontend-domain.com
```

### Step 2: Verify API Key Format

Your RESEND_API_KEY should:
- ✅ Start with `re_`
- ✅ Be about 49 characters long
- ✅ Not contain "PLACEHOLDER" text
- ✅ Have no trailing spaces

### Step 3: Test Email Domain

The current `fromEmail` is set to use Resend's test domain:
```javascript
fromEmail = 'BONDS <onboarding@resend.dev>'
```

This should work immediately. For production, you'll need to:
1. Add your domain in Resend dashboard
2. Verify DNS records
3. Update the `fromEmail` in `EmailService.js`

### Step 4: Run Diagnostic Tests

Run these commands to test:

```bash
# Test 1: Basic diagnosis
node diagnose-render-email.js

# Test 2: Simple email test
node test-render-email-simple.js

# Test 3: Full Magic Link test
node test-magic-link-system.js
```

## 🚀 Quick Fix for Render

### Option 1: Use Resend Test Domain (Recommended)

The EmailService is now configured to use `onboarding@resend.dev` which should work immediately.

### Option 2: Add Your Own Domain

1. **In Resend Dashboard:**
   - Go to Domains section
   - Click "Add Domain"
   - Enter your domain (e.g., `bonds-app.com`)
   - Follow DNS verification steps

2. **Update EmailService:**
   ```javascript
   this.fromEmail = 'BONDS <noreply@yourdomain.com>';
   ```

## 🔧 Environment Variable Setup

### In Render Dashboard:

1. **Service Settings** → **Environment**
2. **Add Environment Variable:**
   ```
   Key: RESEND_API_KEY
   Value: re_your_actual_api_key_here
   ```
3. **Save Changes**
4. **Redeploy** your service

### Verify Variables:

Add this temporary endpoint to test:
```javascript
app.get('/api/debug-env', (req, res) => {
  res.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    keyLength: process.env.RESEND_API_KEY?.length,
    keyPreview: process.env.RESEND_API_KEY?.substring(0, 10) + '...',
    clientUrl: process.env.CLIENT_URL
  });
});
```

## 🧪 Testing Steps

### 1. Local Test (Should Work)
```bash
cd backend
node test-render-email-simple.js
```

### 2. Render Test
After deploying, visit:
```
https://your-backend.onrender.com/api/test-email
```

### 3. Magic Link Test
Try the signup flow:
```
https://your-frontend.vercel.app/register
```

## 📋 Checklist

- [ ] RESEND_API_KEY set in Render environment
- [ ] API key starts with `re_`
- [ ] No placeholder text in API key
- [ ] Using `onboarding@resend.dev` as from domain
- [ ] Service redeployed after environment changes
- [ ] Test endpoint returns success

## 🎯 Expected Results

After fixing:
- ✅ Magic links generate successfully
- ✅ Emails send without errors
- ✅ Users receive magic link emails
- ✅ No fallback messages in logs

## 🆘 Still Not Working?

If emails still fail:

1. **Check Resend Dashboard:**
   - Go to Logs section
   - Look for failed email attempts
   - Check API usage and limits

2. **Verify API Key:**
   - Generate a new API key
   - Update in Render environment
   - Redeploy service

3. **Contact Support:**
   - Check Resend status page
   - Contact Resend support if needed

## 🎉 Success Indicators

You'll know it's working when:
- No "Email delivery failed" messages
- Users receive actual emails
- Magic link verification works end-to-end
- Render logs show successful email sends