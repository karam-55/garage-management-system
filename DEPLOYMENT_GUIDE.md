# Garage Management System - Online Demo Deployment Guide

## 📋 Overview
This guide will help you deploy the Garage Management System as an online demo using:
- **Backend**: Render.com (Free tier)
- **Web Panel**: Cloudflare Pages (Free tier)
- **Database**: Render PostgreSQL (Free tier)

---

## 🚀 Part 1: Database Setup (Render PostgreSQL)

### Step 1: Create Database on Render
1. In Render dashboard, click **"New +"**
2. Select **"PostgreSQL"**
3. **Name**: `garage-db`
4. **Database**: `garage_db`
5. **User**: `garage_user`
6. Click **"Create Database"**

### Step 2: Get Connection String
1. After creation, go to **"Connection Details"**
2. Copy the **Connection string** (PostgreSQL URL)
3. It should look like:
   ```
   postgresql://garage_user:password@dpg-xxx/garage_db
   ```

### Step 3: Use in Backend
The database will be linked automatically in the Backend deployment step.

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

# CORS (For Cloudflare Pages Web Panel)
CORS_ORIGIN=https://your-pages.pages.dev,http://localhost:3000
SOCKET_CORS_ORIGIN=https://your-pages.pages.dev,http://localhost:3000

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

## 🌐 Part 3: Web Panel Deployment (Cloudflare Pages)

### Step 1: Create Cloudflare Account
1. Go to https://dash.cloudflare.com
2. Sign up for a free account

### Step 2: Connect GitHub
1. Go to **Workers & Pages**
2. Click **"Create application"**
3. Select **"Pages"**
4. Click **"Connect to Git"**
5. Select GitHub and authorize
6. Select repository: `karam-55/garage-management-system`
7. Click **"Begin setup"**

### Step 3: Configure Project
- **Project name**: `garage-web-panel`
- **Production branch**: `main`
- **Root directory**: `apps/web-panel`
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Framework preset**: `Next.js`

### Step 4: Configure Environment Variables
Add these environment variables:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://garage-backend.onrender.com

# Environment
NODE_ENV=production
```

### Step 5: Deploy
1. Click **"Save and Deploy"**
2. Wait for deployment to complete (2-3 minutes)
3. Copy the web panel URL: `https://garage-web-panel.pages.dev`

---

## 📱 Part 4: QR Session Page (Standalone)

### Step 1: Deploy QR Page
The QR Session Page is already integrated in the Web Panel at `/qr/:token`

### Step 2: Test QR Page
1. Access: `https://garage-web-panel.pages.dev/qr/test-token`
2. Should work without authentication
3. Connects to backend for validation

---

## 🔧 Part 5: Post-Deployment Configuration

### Update Backend CORS
After deploying Web Panel on Cloudflare Pages:
1. Go to Render Dashboard
2. Edit Web Service environment variables
3. Update `CORS_ORIGIN` with actual Cloudflare Pages URL:
   ```bash
   CORS_ORIGIN=https://your-actual-app.pages.dev,http://localhost:3000
   ```
4. Redeploy backend

---

## ✅ Part 6: Verification Checklist

### Backend (Render)
- [ ] Backend is deployed and accessible
- [ ] Health check works: `https://garage-backend.onrender.com/health`
- [ ] Database migrations ran successfully
- [ ] CORS is configured for Cloudflare Pages domain

### Web Panel (Cloudflare Pages)
- [ ] Web Panel is deployed and accessible
- [ ] API URL is correctly set to backend URL
- [ ] All pages load without errors
- [ ] Authentication works

### Database (Render)
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
CORS_ORIGIN=https://your-app.pages.dev,http://localhost:3000
SOCKET_CORS_ORIGIN=https://your-app.pages.dev,http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Web Panel (Cloudflare Pages)
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
- `apps/web-panel/_headers` - Cloudflare Pages security headers
- `apps/web-panel/_redirects` - Cloudflare Pages redirects
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

# Cloudflare Pages
npm run build
```

---

## 🚀 Deployment URLs (After Deployment)

Replace with your actual URLs:
- **Backend**: `https://garage-backend.onrender.com`
- **Web Panel**: `https://garage-web-panel.pages.dev`
- **Database**: Render PostgreSQL
- **QR Page**: `https://garage-web-panel.pages.dev/qr/:token`

---

## 💰 Cost Summary (Free Tier)

- **Render.com**: $0/month (Free tier includes 750 hours/month)
- **Cloudflare Pages**: $0/month (Free tier includes unlimited bandwidth)
- **Render PostgreSQL**: $0/month (Free tier includes 90 days)

**Total Monthly Cost**: $0

---

## 🔄 Updating the Demo

### To update backend:
1. Push changes to GitHub
2. Render auto-deploys on push

### To update web panel:
1. Push changes to GitHub
2. Cloudflare Pages auto-deploys on push

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
- Check Cloudflare Pages logs
- Verify NEXT_PUBLIC_API_URL is correct
- Check browser console for errors

### CORS Issues
- Ensure backend CORS_ORIGIN includes Cloudflare Pages domain
- Check both frontend and backend logs

---

## 📞 Support

For issues with:
- **Render**: https://render.com/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Cloudflare Workers**: https://developers.cloudflare.com/workers

---

## 🎉 Done!

Your Garage Management System is now deployed as an online demo!
