# StackOverflow Clone — Advanced Developer Community

A comprehensive, full-stack developer community platform built on the foundations of Stack Overflow. This application goes beyond standard Q&A by introducing a public social feed, subscription management, an engaging reward system, secure multi-language support, and highly specific authentication rules.

The project is divided into two parts: a Node.js/Express REST API and a Next.js 15 frontend.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Core Q&A & Reward System](#core-qa--reward-system)
  - [Public Social Space](#public-social-space)
  - [Subscription Plans](#subscription-plans)
  - [Multi-Language Functionality](#multi-language-functionality)
  - [Authentication & Login Rules](#authentication--login-rules)
  - [Secure Forgot Password](#secure-forgot-password)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

This platform is designed to encourage meaningful social connections and high-quality contributions among developers. By incorporating gamification (points), subscription-based posting limits, and stringent security rules (time-gated logins, browser-specific OTPs), it represents a production-grade community system.

---

## Key Features

### Core Q&A & Reward System
The foundational feature set mirrors Stack Overflow but includes an advanced point-based reward system to encourage quality contributions:
- **Earn Points**: Users earn **5 points** for answering a question. If an answer reaches exactly **5 upvotes**, the author receives an additional **5 bonus points**.
- **Lose Points**: Points are deducted if an answer is deleted, removed, or receives a downvote.
- **Point Transfers**: Users can search for other user profiles and transfer points. A user must have more than 10 points to initiate a transfer.

### Public Social Space
A dedicated `/social` route where users can connect by uploading photos, videos, or sharing YouTube links, alongside liking, commenting, and sharing posts.
- **Friend-Based Limits**: Posting is restricted based on social connections to encourage network building:
  - **0 Friends**: Cannot post on the public page.
  - **1 Friend**: 1 post per day.
  - **2 Friends**: 2 posts per day.
  - **>10 Friends**: Unlimited posts.

### Subscription Plans
Users can post questions based on their active subscription tier, powered by Stripe integrations.
- **Free Plan**: 1 question per day.
- **Bronze Plan** (₹100/month): 5 questions per day.
- **Silver Plan** (₹300/month): 10 questions per day.
- **Gold Plan** (₹1000/month): Unlimited questions.
- **Strict Time Gate**: Payments are strictly processed only between **10:00 AM and 11:00 AM IST**.
- **Invoicing**: Automatic invoice and subscription details are emailed upon successful payment.

### Multi-Language Functionality
The application supports English, Spanish, Hindi, Portuguese, Chinese, and French. Switching languages securely requires OTP verification:
- **French**: Sends an OTP to the user's registered **Email**.
- **Other Languages** (e.g., Spanish, Hindi): Simulates sending an OTP to the user's registered **Mobile Number**.

### Authentication & Login Rules
Detailed login history is tracked (Browser, OS, Device Type, IP Address) and visible in the user's profile. Strict environmental rules govern the login flow:
- **Google Chrome**: Requires Email OTP verification before access is granted.
- **Microsoft Browsers (Edge/IE)**: Direct access without additional OTP authentication.
- **Mobile Devices**: Access is time-restricted to between **10:00 AM and 1:00 PM**. Logins outside this window are automatically denied.

### Secure Forgot Password
A dedicated, rate-limited flow for account recovery.
- Users can request a reset using either their **Email Address or Phone Number**.
- **Limit**: Only 1 request allowed per day.
- **Secure Password Generator**: Automatically generates a secure, randomized password consisting *only* of uppercase and lowercase letters (no numbers or special characters).

---

## Technology Stack

### Backend
- **Runtime**: Node.js & Express
- **Database**: MongoDB with Mongoose
- **Auth**: JSON Web Tokens (JWT), Google Auth Library
- **Payments**: Stripe SDK
- **Utilities**: Nodemailer (Email/OTP), ua-parser-js (Device/Browser tracking), Cloudinary (Media uploads)

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS, Radix UI components
- **HTTP Client**: Axios
- **Payments**: React Stripe.js

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB instance
- Stripe account (Test API keys)
- Google Cloud Project (OAuth Client ID)
- Gmail App Password for Nodemailer
- Cloudinary Account

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Fill in your environment variables in .env
npm start
```
The API server will run on `http://localhost:5000`.

### Frontend Setup
```bash
cd stack
npm install
cp .env.local.example .env.local
# Fill in your environment variables in .env.local
npm run dev
```
The web application will be available at `http://localhost:3000`.

---

## Environment Variables

**Backend (`server/.env`)**
```env
PORT=5000
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_CLIENT_ID=your-google-client-id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your-gemini-key
```

**Frontend (`stack/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

---

## License

This project is licensed under the ISC License.
