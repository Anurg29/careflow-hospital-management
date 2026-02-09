# 🚀 CareFlow Deployment Guide

## 📋 Prerequisites

1. **GitHub Account** - To push your code
2. **Render Account** - For backend deployment (free tier available) - https://render.com
3. **Netlify Account** - For frontend deployment (free tier available) - https://netlify.com
4. **MongoDB Atlas** - Already configured ✅

---

## Part 1: Push to GitHub

1. Initialize git repository (if not already done):
   ```bash
   cd /Users/anuragdineshrokade/Documents/doctor
   git init
   git add .
   git commit -m "Initial commit - CareFlow Hospital Management System"
   ```

2. Create a new repository on GitHub (https://github.com/new)
   - Name: `careflow-hospital-management`
   - Keep it Public or Private
   - Don't initialize with README (we already have code)

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/careflow-hospital-management.git
   git branch -M main
   git push -u origin main
   ```

---

## Part 2: Deploy Backend to Render

### 2.1 Create Render Account
1. **Go to** https://render.com and sign in with GitHub

### 2.2 Create Web Service
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
   - Select: `careflow-hospital-management`
   - Render will detect it's a Python app

### 2.3 Configure the Service
4. **Configure build settings:**
   - **Name**: `careflow-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn hospital_queue.asgi:application -k uvicorn.workers.UvicornWorker`
   - **Plan**: Free

### 2.4 Add Environment Variables
5. **Add Environment Variables** (in Render dashboard):

   ⚠️ **IMPORTANT**: Replace the values below with your actual credentials!

   ```
   DJANGO_SECRET_KEY = [Generate using: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"]
   DJANGO_DEBUG = false
   DJANGO_ALLOWED_HOSTS = careflow-backend.onrender.com
   MONGO_URL = [Your MongoDB Atlas connection string from Atlas dashboard]
   MONGO_DB_NAME = careflow
   CORS_ALLOWED_ORIGINS = https://your-frontend-url.netlify.app
   REDIS_URL = (leave empty for now)
   ```

   **To get your MongoDB URL:**
   - Go to MongoDB Atlas → Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your actual database password
   - DO NOT commit this to Git!

### 2.5 Deploy
6. **Click "Create Web Service"**
   - Wait for deployment to complete (5-10 minutes)
   - Note your backend URL: `https://careflow-backend.onrender.com`

---

## Part 3: Deploy Frontend to Netlify

### 3.1 Create Netlify Account
1. **Go to** https://netlify.com and sign in with GitHub

### 3.2 Import Project
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to GitHub**
   - Authorize Netlify
   - Select: `careflow-hospital-management`

### 3.3 Configure Build Settings
4. **Configure build settings:**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### 3.4 Add Environment Variables
5. **Add Environment Variables** (in Netlify dashboard):
   ```
   VITE_API_BASE = https://careflow-backend.onrender.com
   VITE_WS_BASE = wss://careflow-backend.onrender.com
   ```

### 3.5 Deploy
6. **Click "Deploy site"**
   - Wait for deployment (2-3 minutes)
   - Note your frontend URL: `https://your-site-name.netlify.app`

---

## Part 4: Update Backend CORS Settings

1. Go back to **Render dashboard**
2. Update the `CORS_ALLOWED_ORIGINS` environment variable:
   ```
   CORS_ALLOWED_ORIGINS = https://your-actual-site-name.netlify.app
   ```
3. Click "Save" - this will trigger a redeploy

---

## ✅ Verification

1. **Visit your frontend URL**: `https://your-site-name.netlify.app`
2. **Test Registration**: Create a new admin account
3. **Test Hospital Creation**: Add a hospital
4. **Test Real-time Features**: Connect WebSocket and add patients

---

## 🔧 Troubleshooting

### Backend Issues:
- Check Render logs: Dashboard → Your Service → Logs
- Ensure all environment variables are set correctly
- Verify MongoDB connection string is correct

### Frontend Issues:
- Check Netlify deploy logs
- Verify `VITE_API_BASE` points to your Render backend URL
- Check browser console for CORS errors

### CORS Errors:
- Ensure `CORS_ALLOWED_ORIGINS` in Render includes your Netlify URL
- Make sure to include `https://` in the URLs
- Redeploy backend after updating CORS settings

---

## 🔐 Security Checklist

- [x] `DEBUG=false` in production
- [x] Strong `SECRET_KEY` (50+ characters)
- [x] `ALLOWED_HOSTS` restricted
- [x] `CORS_ALLOWED_ORIGINS` restricted
- [x] MongoDB password secure
- [x] JWT authentication enabled
- [x] Rate limiting: 30/min (anon), 120/min (auth)
- [x] HTTPS enforced (automatic)
- [x] `.env` files in `.gitignore`
- [x] No secrets committed to Git

---

## 💡 Tips

- Free tier services may sleep after 15 mins of inactivity
- First request after sleeping takes ~30 seconds to wake up
- Upgrade to paid tiers for always-on service and better performance
- Monitor your MongoDB Atlas usage (free tier has 512MB limit)

---

## 📊 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Render** | Free | **$0** (with 15min sleep) |
| **Netlify** | Free | **$0** |
| **MongoDB Atlas** | M0 Free | **$0** |
| **Total** | | **$0/month** ✅ |

---

## 🎉 You're Live!

Your CareFlow application is now deployed and accessible worldwide!

- **Frontend**: https://your-site-name.netlify.app
- **Backend API**: https://careflow-backend.onrender.com/api/
- **Admin Panel**: https://careflow-backend.onrender.com/admin/
