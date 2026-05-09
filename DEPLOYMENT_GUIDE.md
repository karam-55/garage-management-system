# Garage Management System - Online Demo Deployment Guide

## 📋 Overview
This guide will help you deploy the Garage Management System as an online demo using:
- **Backend**: Render.com (Free tier)
- **Web Panel**: Vercel (Free tier)
- **Database**: Neon.tech (Free tier)

---

## 🚀 Part 1: Database Setup (Neon.tech)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Sign up for a free account
3. Click **"Create a project"**

### Step 2: Create Database
1. **Project name**: `garage-demo`
2. **Database name**: `garage_db`
3. **Region**: Choose nearest region
4. Click **"Create project"**

### Step 3: Get Connection String
1. After creation, go to **"Connection Details"**
2. Copy the **Connection string** (PostgreSQL URL)
3. It should look like:
   ```
   postgresql://user:password@ep-cool-name.us-east-2.aws.neon.tech/garage_db?sslmode=require
   ```

### Step 4: Run Prisma Migrations
On your local machine:
```bash
cd apps/backend
# Update DATABASE_URL in .env with Neon connection string
npx prisma migrate deploy
```

---

## 🎯 Part 2: Backend Deployment (Render.com)

### Step 1: Create Render Account
1. Go to https://dashboard.render.com
2. Sign up for a free account

### Step 2: Connect GitHub
1. Click **"New +"**
2. Click **"Web Service"**
3. Click **"Connect GitHub"**
4. Authorize Render to access your GitHub
5. Select repository: `karam-55/garage-management-system`
6. Click **"Connect"**

### Step 3: Configure Web Service
- **Name**: `garage-backend`
- **Root Directory**: `apps/backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npx prisma migrate deploy && npm run build`
- **Start Command**: `npm run start:prod`

### Step 4: Create Database on Render
1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. **Name**: `garage-db`
4. **Database**: `garage_db`
5. **User**: `garage_user`
6. Click **"Create Database"**

### Step 5: Configure Environment Variables
In Web Service settings, add these environment variables:

```bash
# Database (Link to Render database)
DATABASE_URL=<link-to-render-database>

# JWT (Generate secure values)
JWT_SECRET=<generate-random-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
NODE_ENV=production
PORT=3001

# CORS (For Vercel Web Panel)
CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:3000
SOCKET_CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# WhatsApp (Optional - leave empty)
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER_ID=

# Email (Optional - leave empty)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

### Step 6: Deploy
1. Click **"Create Web Service"**
2. Wait for deployment to complete (3-5 minutes)
3. Copy the backend URL: `https://garage-backend.onrender.com`

---

## 🌐 Part 3: Web Panel Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up for a free account

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import from GitHub: `karam-55/garage-management-system`
3. Select directory: `apps/web-panel`
4. Click **"Import"**

### Step 3: Configure Project
- **Framework Preset**: Next.js
- **Root Directory**: `apps/web-panel`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Step 4: Configure Environment Variables
Add these environment variables:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://garage-backend.onrender.com

# Environment
NODE_ENV=production
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Copy the web panel URL: `https://your-app.vercel.app`

---

## 📱 Part 4: QR Session Page (Standalone)

### Step 1: Deploy QR Page
The QR Session Page is already integrated in the Web Panel at `/qr/:token`

### Step 2: Test QR Page
1. Access: `https://your-vercel-app.vercel.app/qr/test-token`
2. Should work without authentication
3. Connects to backend for validation

---

## 🔧 Part 5: Post-Deployment Configuration

### Update Backend CORS
After deploying Web Panel on Vercel:
1. Go to Render Dashboard
2. Edit Web Service environment variables
3. Update `CORS_ORIGIN` with actual Vercel URL:
   ```bash
   CORS_ORIGIN=https://your-actual-vercel-app.vercel.app,http://localhost:3000
   ```
4. Redeploy backend

---

## ✅ Part 6: Verification Checklist

### Backend (Render)
- [ ] Backend is deployed and accessible
- [ ] Health check works: `https://garage-backend.onrender.com/health`
- [ ] Database migrations ran successfully
- [ ] CORS is configured for Vercel domain

### Web Panel (Vercel)
- [ ] Web Panel is deployed and accessible
- [ ] API URL is correctly set to backend URL
- [ ] All pages load without errors
- [ ] Authentication works

### Database (Neon/Render)
- [ ] Database is accessible
- [ ] All tables are created
- [ ] Connection string is correct

### QR Session Page
- [ ] QR page is accessible
- [ ] Works without authentication
- [ ] Connects to backend successfully

---

## 🔑 Environment Variables Summary

### Backend (Render)
```bash
DATABASE_URL=<postgresql-connection-string>
JWT_SECRET=<random-secret-key>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:3000
SOCKET_CORS_ORIGIN=https://your-vercel-app.vercel.app,http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Web Panel (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://garage-backend.onrender.com
NODE_ENV=production
```

---

## 📝 Files Modified/Created

### Backend
- `apps/backend/Dockerfile` - Docker configuration
- `apps/backend/.dockerignore` - Docker ignore file
- `apps/backend/.env.example` - Environment variables template
- `apps/backend/src/health/health.controller.ts` - Health check endpoint
- `apps/backend/src/health/health.module.ts` - Health module
- `apps/backend/src/app.module.ts` - Added HealthModule

### Web Panel
- `apps/web-panel/vercel.json` - Vercel configuration
- `apps/web-panel/.env.example` - Environment variables template
- `apps/web-panel/src/lib/api-client.ts` - Already configured for NEXT_PUBLIC_API_URL

---

## 🎯 Build Commands

### Backend
```bash
# Local
npm run build
npm run start:prod

# Render
npm install && npx prisma migrate deploy && npm run build
npm run start:prod
```

### Web Panel
```bash
# Local
npm run build
npm run start

# Vercel
npm run build
```

---

## 🚀 Deployment URLs (After Deployment)

Replace with your actual URLs:
- **Backend**: `https://garage-backend.onrender.com`
- **Web Panel**: `https://garage-management.vercel.app`
- **Database**: Render PostgreSQL or Neon PostgreSQL
- **QR Page**: `https://garage-management.vercel.app/qr/:token`

---

## 💰 Cost Summary (Free Tier)

- **Render.com**: $0/month (Free tier includes 750 hours/month)
- **Vercel**: $0/month (Free tier includes 100GB bandwidth)
- **Neon.tech**: $0/month (Free tier includes 0.5GB storage)

**Total Monthly Cost**: $0

---

## 🔄 Updating the Demo

### To update backend:
1. Push changes to GitHub
2. Render auto-deploys on push

### To update web panel:
1. Push changes to GitHub
2. Vercel auto-deploys on push

### To run database migrations:
```bash
cd apps/backend
npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### Backend Issues
- Check Render logs for errors
- Verify DATABASE_URL is correct
- Ensure Prisma migrations ran successfully

### Web Panel Issues
- Check Vercel logs
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for errors

### CORS Issues
- Ensure backend CORS_ORIGIN includes Vercel domain
- Check both frontend and backend logs

---

## 📞 Support

For issues with:
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs
- **Neon**: https://neon.tech/docs

---

## 🎉 Done!

Your Garage Management System is now deployed as an online demo!
