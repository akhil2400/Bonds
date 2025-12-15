# 🖼️ Cloudinary Setup Guide

## 📋 Overview
This guide will help you set up Cloudinary for image storage in your Bonds application.

## 🚀 Step 1: Create Cloudinary Account

1. **Go to Cloudinary**: https://cloudinary.com/
2. **Sign up** for a free account
3. **Verify your email** address
4. **Complete the setup** process

## 🔑 Step 2: Get Your Credentials

1. **Login to Cloudinary Dashboard**
2. **Go to Dashboard** (should be the default page)
3. **Find your credentials** in the "Account Details" section:
   - **Cloud Name**: (e.g., `your-cloud-name`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## ⚙️ Step 3: Update Environment Variables

Update your `backend/.env` file with your Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
```

**Important**: Replace the placeholder values with your actual Cloudinary credentials.

## 🧪 Step 4: Test the Setup

1. **Restart your backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Try uploading an image** through the Memories page
3. **Check your Cloudinary dashboard** - you should see the uploaded images in the `bonds/memories` folder

## 📁 Step 5: Folder Structure

Images will be organized in Cloudinary as follows:
- **Memories**: `bonds/memories/`
- **Timeline**: `bonds/timeline/`
- **Trips**: `bonds/trips/`

## 🔧 Features Included

✅ **Automatic Image Optimization**: Images are automatically optimized for web  
✅ **Multiple Format Support**: JPEG, PNG, WebP, etc.  
✅ **Responsive Images**: Automatic resizing and quality adjustment  
✅ **Secure Storage**: Images are stored securely in the cloud  
✅ **CDN Delivery**: Fast global image delivery  
✅ **Automatic Cleanup**: Images are deleted when memories are deleted  

## 💡 Free Tier Limits

Cloudinary free tier includes:
- **25 GB storage**
- **25 GB monthly bandwidth**
- **1,000 transformations per month**

This should be more than enough for a personal friendship app!

## 🛠️ Troubleshooting

### Issue: "Invalid credentials" error
- **Solution**: Double-check your Cloud Name, API Key, and API Secret in the `.env` file

### Issue: Images not uploading
- **Solution**: Make sure you restarted the backend server after updating `.env`

### Issue: Images not showing
- **Solution**: Check the browser console for CORS errors and verify the image URLs

## 🎉 You're Ready!

Once configured, you can:
- Upload multiple images when creating memories
- Images are automatically optimized and stored in Cloudinary
- View high-quality images with fast loading
- Images are automatically deleted when memories are removed

Enjoy your cloud-powered image storage! 📸✨