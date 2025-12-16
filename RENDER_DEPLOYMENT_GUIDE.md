# BONDS Backend Deployment on Render

## Prerequisites
- MongoDB Atlas cluster set up and running
- Gmail account with App Password generated
- Cloudinary account for image storage

## Environment Variables for Render

Set these environment variables in your Render dashboard:

### Required Variables
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority&appName=Cluster
JWT_SECRET=your-super-strong-jwt-secret-minimum-32-characters-long
JWT_EXPIRE=30d
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-gmail-app-password
CLIENT_URL=https://your-frontend-app.vercel.app
```

### Optional Variables
```
OTP_EXPIRY_MINUTES=5
COOKIE_DOMAIN=
TRUSTED_EMAIL_1=friend1@example.com
TRUSTED_EMAIL_2=friend2@example.com
TRUSTED_EMAIL_3=friend3@example.com
TRUSTED_EMAIL_4=friend4@example.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Deployment Steps

### 1. Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `bonds-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for production)

### 2. Set Environment Variables
1. In your Render service dashboard, go to "Environment"
2. Add all the environment variables listed above
3. Make sure to use your actual values

### 3. Deploy
1. Click "Create Web Service"
2. Render will automatically deploy your backend
3. Monitor the deployment logs for any errors

## Health Check Endpoints

Your deployed backend will have these endpoints:
- `GET /` - Basic server status
- `GET /health` - Detailed health check with database status
- `GET /api/test` - Simple API test endpoint

## Security Features Enabled

✅ **Helmet** - Security headers  
✅ **CORS** - Cross-origin protection with Vercel support  
✅ **Rate Limiting** - API abuse prevention  
✅ **XSS Protection** - Cross-site scripting prevention  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Password Hashing** - bcrypt with salt rounds  
✅ **OTP Security** - Hashed OTP storage with expiry  

## Production Optimizations

- Database connection with proper error handling
- Email service with retry logic
- Background OTP cleanup every hour
- Comprehensive error logging
- Process exit on critical failures
- MongoDB Atlas connection with timeouts

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Render)
- Verify connection string format
- Ensure database user has proper permissions

**Email Service Failed**
- Verify Gmail App Password is correct
- Check EMAIL_USER and EMAIL_PASS variables
- Ensure 2FA is enabled on Gmail account

**CORS Errors**
- Update CLIENT_URL with your Vercel deployment URL
- Ensure frontend URL matches exactly (no trailing slash)

**JWT Errors**
- Ensure JWT_SECRET is at least 32 characters
- Use a strong, random secret for production

## Monitoring

Monitor your deployment:
1. Check Render service logs for errors
2. Use health check endpoints to verify status
3. Monitor database connections in MongoDB Atlas
4. Check email delivery in Gmail sent folder

## Support

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables are set
3. Test health check endpoints
4. Review MongoDB Atlas network access settings