# Production Connection Setup Guide

## Overview
This guide sets up the production connection between:
- **Frontend**: https://bonds-one.vercel.app/ (Vercel)
- **Backend**: https://bonds-backend-rix0.onrender.com/ (Render)

## Frontend Configuration (Vercel)

### Environment Variables
Set these in your Vercel dashboard:

```
VITE_API_BASE_URL=https://bonds-backend-rix0.onrender.com/api
VITE_APP_NAME=Bonds
VITE_APP_VERSION=1.0.0
```

### Files Updated
- `frontend/.env` - Production API URL
- `frontend/src/config/api.js` - Centralized API configuration
- `frontend/src/services/api.js` - Updated to use config
- `frontend/.env.example` - Environment template

## Backend Configuration (Render)

### Environment Variables
Set these in your Render dashboard:

```
NODE_ENV=production
CLIENT_URL=https://bonds-one.vercel.app
MONGO_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-strong-jwt-secret-32-chars-minimum
JWT_EXPIRE=30d
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
```

### CORS Configuration
- ✅ Allows `https://bonds-one.vercel.app`
- ✅ Allows Vercel preview URLs (`*.vercel.app`)
- ✅ Blocks all other origins in production
- ✅ Enables credentials for authentication

## API Endpoints

All API calls use the base URL: `https://bonds-backend-rix0.onrender.com/api`

### Authentication
- `POST /api/auth/signup` - User registration with OTP
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Password reset with OTP

### Content Management
- `GET /api/memories` - Get memories
- `POST /api/memories` - Create memory
- `GET /api/timeline` - Get timeline events
- `POST /api/timeline` - Create timeline event
- `GET /api/thoughts` - Get thoughts
- `POST /api/thoughts` - Create thought
- `GET /api/trips` - Get trips
- `POST /api/trips` - Create trip
- `GET /api/music` - Get music
- `POST /api/music` - Create music

### Health Checks
- `GET /` - Basic server status
- `GET /health` - Detailed health check
- `GET /api/test` - API test endpoint

## Security Features

### HTTPS Enforcement
- ✅ All production traffic uses HTTPS
- ✅ Frontend validates HTTPS in production
- ✅ Backend requires secure origins

### CORS Protection
- ✅ Strict origin validation
- ✅ No wildcard origins in production
- ✅ Credentials support for authentication

### Authentication
- ✅ JWT tokens with secure secrets
- ✅ HTTP-only cookies for web
- ✅ Authorization headers for mobile

## Testing Connection

### Frontend Connection Test
```javascript
import { testBackendConnection } from './src/utils/connectionTest.js';

// Test backend connectivity
const result = await testBackendConnection();
console.log('Connection test:', result);
```

### Manual Testing
1. **Health Check**: Visit https://bonds-backend-rix0.onrender.com/health
2. **API Test**: Visit https://bonds-backend-rix0.onrender.com/api/test
3. **Frontend**: Visit https://bonds-one.vercel.app/

## Troubleshooting

### CORS Errors
- Verify `CLIENT_URL` is set to `https://bonds-one.vercel.app`
- Check Render environment variables
- Ensure frontend uses HTTPS

### Authentication Issues
- Verify JWT_SECRET is set and strong (32+ characters)
- Check cookie settings and credentials
- Ensure HTTPS for secure cookies

### Network Errors
- Check Render service status
- Verify MongoDB Atlas connection
- Test health endpoints

### Email Issues
- Verify Gmail App Password
- Check EMAIL_USER and EMAIL_PASS
- Test OTP sending manually

## Deployment Checklist

### Before Deploying
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on both platforms
- [ ] MongoDB Atlas IP whitelist updated
- [ ] Gmail App Password configured

### After Deploying
- [ ] Test health endpoints
- [ ] Test user registration with OTP
- [ ] Test login/logout flow
- [ ] Test memory creation
- [ ] Test forgot password flow

## Support

If you encounter issues:
1. Check service logs (Render/Vercel dashboards)
2. Test health endpoints
3. Verify environment variables
4. Check CORS configuration
5. Test database connectivity