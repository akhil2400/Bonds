# Bonds 💝

**Where friendships live forever**

A beautiful, private space to treasure memories, share moments, and celebrate the extraordinary journey of your friendships.

## ✨ Features

- **Private Memory Sanctuary** - A secure space for your most precious friendship memories
- **Beautiful Design** - Elegant Louisville Script typography with warm, sophisticated colors
- **OTP Email Verification** - Secure signup with real Gmail integration
- **Responsive Design** - Perfect experience across all devices
- **Friendship-Focused** - Built specifically for celebrating lasting friendships

## 🎨 Design

- **Color Palette**: Golden orange (#faa916), Deep burgundy (#96031a), Purple-gray (#6d676e)
- **Typography**: Louisville Script Bold for headings, Inter for readability
- **Animations**: Smooth, elegant transitions and micro-interactions
- **Layout**: Modern, clean design with floating elements and gradients

## 🚀 Tech Stack

### Frontend
- **React** with Vite
- **React Router** for navigation
- **Custom CSS** with CSS variables
- **Responsive design** with mobile-first approach

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT Authentication** with secure cookies
- **Resend** for Magic Link email delivery
- **bcryptjs** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Gmail account with App Password

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
COOKIE_DOMAIN=localhost

# Email Configuration
EMAIL_FROM="Bonds App" <noreply@bonds.app>
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
OTP_EXPIRY_MINUTES=5
```

### Frontend Setup
```bash
cd frontend
npm install
```

## 🏃‍♂️ Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on http://localhost:5000

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## 📱 Features Overview

### Authentication
- **Secure Signup** with email verification
- **OTP-based verification** sent to real Gmail addresses
- **JWT tokens** with httpOnly cookies
- **Password hashing** with bcrypt

### Design System
- **Elegant animations** and transitions
- **Floating background elements**
- **Gradient effects** and glows
- **Responsive typography** scaling
- **Touch-friendly** mobile interface

### Security
- **Rate limiting** for authentication endpoints
- **Input validation** and sanitization
- **Secure cookie configuration**
- **Environment variable protection**

## 🎯 Project Structure

```
BONDS/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middlewares/     # Custom middleware
│   ├── models/          # MongoDB models
│   ├── repositories/    # Data access layer
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── styles/      # CSS files
│   └── index.html       # HTML template
└── README.md
```

## 🌟 Key Highlights

- **Friendship-Centered Design** - Every element designed for celebrating friendships
- **Premium Feel** - Sophisticated animations and elegant typography
- **Real Email Integration** - Actual Gmail SMTP for OTP delivery
- **Mobile-First** - Beautiful responsive design for all devices
- **Secure Architecture** - Modern security practices throughout

## 🤝 Contributing

This is a personal project celebrating friendships. Feel free to fork and create your own version!

## 📄 License

MIT License - Feel free to use this code for your own friendship celebration app!

---

**Made with 💝 for friendships that last a lifetime**