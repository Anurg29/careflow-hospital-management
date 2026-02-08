# 🚀 CareFlow Deployment Guide# 🚀 CareFlow Deployment Guide# CareFlow Deployment Guide

## Render (Backend) + Firebase (Frontend)



---

## Architecture OverviewThis guide will help you deploy the CareFlow Hospital Queue Management System to production.

## 🏗️ Architecture



- **Frontend (React + Vite)** → **Firebase Hosting** (Free: 10GB storage, 360MB/day bandwidth)

- **Backend (Django + MongoDB)** → **Render** (Free: 750 hours/month, spins down after inactivity)- **Frontend (React + Vite)** → **Vercel** (Free tier, unlimited bandwidth)## 📋 Prerequisites

- **Database** → **MongoDB Atlas** (Free: 512MB storage) ✅ Already configured!

- **Backend (Django + MongoDB Atlas)** → **Railway** ($5 free credits/month)

---

- **Database** → **MongoDB Atlas** (Free tier, 512MB - already configured!)1. **GitHub Account** - To push your code

## Part 1: Deploy Backend to Render 🔧

2. **Render Account** - For backend deployment (free tier available)

### 1.1 Create Render Account

1. Go to **[render.com](https://render.com)**---3. **Netlify Account** - For frontend deployment (free tier available)

2. Click **"Get Started"** → Sign up with **GitHub**

3. Authorize Render to access your repositories4. **MongoDB Atlas** - Already configured ✅



### 1.2 Create Web Service## Part 1: Deploy Backend to Railway ⚡

1. Click **"New +"** → **"Web Service"**

2. Connect your **`careflow-hospital-management`** repository## 🚀 Deployment Steps

3. Render will auto-detect it

### 1.1 Create Railway Account

### 1.3 Configure Service

Fill in these settings:1. Go to [railway.app](https://railway.app)### Part 1: Push to GitHub



**Basic Settings:**2. Click **"Login"** → Sign in with **GitHub** (easiest option)

- **Name:** `careflow-backend`

- **Region:** `Oregon (US West)` (or closest to you)3. Authorize Railway to access your GitHub repos1. Initialize git repository (if not already done):

- **Branch:** `main`

- **Root Directory:** `backend`   ```bash

- **Runtime:** `Python 3`

- **Build Command:**### 1.2 Deploy Your Backend   cd /Users/anuragdineshrokade/Documents/doctor

  ```bash

  pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput1. Click **"New Project"**   git init

  ```

- **Start Command:**2. Select **"Deploy from GitHub repo"**   git add .

  ```bash

  gunicorn hospital_queue.wsgi:application3. Choose **`careflow-hospital-management`** repository   git commit -m "Initial commit - CareFlow Hospital Management System"

  ```

4. Railway will auto-detect Django in the `/backend` folder   ```

**Instance Type:**

- Select **"Free"** (750 hours/month)



### 1.4 Add Environment Variables### 1.3 Configure Environment Variables2. Create a new repository on GitHub (https://github.com/new)

Scroll down to **"Environment Variables"** → Click **"Add Environment Variable"** for each:

Go to your project → **Variables** tab → Click **"+ New Variable"** for each:   - Name: `careflow-hospital-management`

```bash

PYTHON_VERSION=3.9.18   - Keep it Public or Private

DJANGO_SECRET_KEY=(c_r+k@qhjx^tilofwv&i9%qlf684^*06-4k0#u&fim&px=r1-

DJANGO_DEBUG=false```bash   - Don't initialize with README (we already have code)

DJANGO_SETTINGS_MODULE=hospital_queue.settings

MONGO_URL=mongodb+srv://anuragrokade965:anurag29@cluster1.1mvedwk.mongodb.net/?appName=Cluster1DJANGO_SECRET_KEY=your-production-secret-key-min-50-chars

MONGO_DB_NAME=careflow

PORT=10000DJANGO_DEBUG=false3. Push to GitHub:

```

MONGO_URL=mongodb+srv://anuragrokade965:anurag29@cluster1.1mvedwk.mongodb.net/?appName=Cluster1   ```bash

### 1.5 Deploy!

1. Click **"Create Web Service"**MONGO_DB_NAME=careflow   git remote add origin https://github.com/YOUR_USERNAME/careflow-hospital-management.git

2. Wait 5-8 minutes for first deployment

3. You'll get a URL like: `https://careflow-backend.onrender.com`PORT=8000   git branch -M main

4. **📋 Copy this URL** - you'll need it for Firebase!

```   git push -u origin main

### 1.6 Test Backend

```bash   ```

curl https://your-render-url.onrender.com/api/hospitals/

```**Generate a strong SECRET_KEY** (run locally):

Should return `[]` (empty array).

```bash### Part 2: Deploy Backend to Render

⚠️ **Note:** Render free tier spins down after 15 minutes of inactivity. First request after sleeping takes ~30 seconds to wake up.

python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

---

```1. **Go to** https://render.com and sign in

## Part 2: Deploy Frontend to Firebase 🔥



### 2.1 Install Firebase CLI

```bash⚠️ **Don't set DJANGO_ALLOWED_HOSTS or CORS_ALLOWED_ORIGINS yet** - we'll add them after getting URLs!2. **Click "New +" → "Web Service"**

npm install -g firebase-tools

```



### 2.2 Login to Firebase### 1.4 Get Your Backend URL3. **Connect your GitHub repository**

```bash

firebase login1. Wait for deployment to complete (~2 minutes)   - Select: `careflow-hospital-management`

```

Your browser will open - sign in with your Google account.2. Go to **Settings** → **Networking** → **Public Networking**   - Render will detect it's a Python app



### 2.3 Create Firebase Project3. Click **"Generate Domain"**

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)**

2. Click **"Add project"**4. You'll get something like: `careflow-production-abc123.up.railway.app`4. **Configure the service:**

3. Name it: `careflow-hospital`

4. Disable Google Analytics (optional)5. **📋 Copy this URL - you'll need it!**   - **Name**: `careflow-backend`

5. Click **"Create project"**

   - **Region**: Oregon (US West)

### 2.4 Initialize Firebase in Your Project

```bashTest your backend:   - **Branch**: `main`

cd /Users/anuragdineshrokade/Documents/doctor/frontend

firebase init hosting```bash   - **Root Directory**: `backend`

```

curl https://your-railway-url.up.railway.app/api/hospitals/   - **Runtime**: Python 3

**Answer the prompts:**

- Use existing project: **careflow-hospital**```   - **Build Command**: `./build.sh`

- Public directory: **dist**

- Single-page app: **Yes**Should return `[]` (empty list).   - **Start Command**: `gunicorn hospital_queue.asgi:application -k uvicorn.workers.UvicornWorker`

- Overwrite index.html: **No**

- Set up automatic builds: **No**   - **Plan**: Free



### 2.5 Update Environment Variable---

Update `.env.production` with your Render backend URL:

5. **Add Environment Variables** (in Render dashboard):

```bash

VITE_API_BASE=https://your-render-backend.onrender.com## Part 2: Deploy Frontend to Vercel 🎨   ```

```

   DJANGO_SECRET_KEY = [Auto-generated by Render]

### 2.6 Build and Deploy

```bash### 2.1 Create Vercel Account   DJANGO_DEBUG = false

# Build optimized production bundle

npm run build1. Go to [vercel.com](https://vercel.com)   DJANGO_ALLOWED_HOSTS = careflow-backend.onrender.com



# Deploy to Firebase2. Click **"Sign Up"** → Choose **"Continue with GitHub"**   MONGO_URL = mongodb+srv://anuragrokade965:anurag29@cluster1.1mvedwk.mongodb.net/?appName=Cluster1

firebase deploy --only hosting

```3. Authorize Vercel   MONGO_DB_NAME = careflow



Wait ~1 minute. You'll get a URL like: `https://careflow-hospital.web.app`  CORS_ALLOWED_ORIGINS = https://your-frontend-url.netlify.app



---### 2.2 Import Your Project   REDIS_URL = (leave empty for now)



## Part 3: Connect Frontend ↔ Backend 🔗1. Click **"Add New..."** → **"Project"**   ```



### 3.1 Update Backend Environment Variables2. Import **`careflow-hospital-management`** repository

Go to **Render Dashboard** → Your Service → **Environment** → Add:

3. Vercel will auto-detect it's a monorepo6. **Click "Create Web Service"**

```bash

DJANGO_ALLOWED_HOSTS=your-render-backend.onrender.com   - Wait for deployment to complete (5-10 minutes)

CORS_ALLOWED_ORIGINS=https://your-firebase-app.web.app,http://localhost:5173

```### 2.3 Configure Build Settings   - Note your backend URL: `https://careflow-backend.onrender.com`



**Replace with your actual URLs:****Root Directory:** `frontend` ⚠️ **Important!**

- Render domain (no `https://`)

- Firebase domain (with `https://`)### Part 3: Deploy Frontend to Netlify



Example:Vercel should auto-fill:

```bash

DJANGO_ALLOWED_HOSTS=careflow-backend.onrender.com- **Framework Preset:** Vite1. **Go to** https://netlify.com and sign in

CORS_ALLOWED_ORIGINS=https://careflow-hospital.web.app,http://localhost:5173

```- **Build Command:** `npm run build`



### 3.2 Manual Redeploy- **Output Directory:** `dist`2. **Click "Add new site" → "Import an existing project"**

Click **"Manual Deploy"** → **"Deploy latest commit"**

- **Install Command:** `npm install`

---

3. **Connect to GitHub**

## Part 4: Test Everything! ✅

### 2.4 Add Environment Variable   - Authorize Netlify

### 4.1 Open Firebase URL

Visit your Firebase hosting URL: `https://your-app.web.app`Click **"Environment Variables"** → Add:   - Select: `careflow-hospital-management`



### 4.2 Test Full Flow

1. ✅ See CareFlow login page with animations

2. ✅ Click **"Register"** → Create account**Key:** `VITE_API_BASE`  4. **Configure build settings:**

3. ✅ Should login and see dashboard

4. ✅ **Manage** tab → Create hospital**Value:** `https://your-railway-url.up.railway.app` (from Part 1.4)   - **Base directory**: `frontend`

5. ✅ Open DevTools → Console → Check for `🔌 WebSocket: connected`

   - **Build command**: `npm run build`

⚠️ **First backend request may take 30s** if Render service was sleeping.

### 2.5 Deploy!   - **Publish directory**: `frontend/dist`

---

1. Click **"Deploy"**

## 🔧 Troubleshooting

2. Wait 1-2 minutes ⏱️5. **Add Environment Variables** (in Netlify dashboard):

### Backend Issues

3. Your app will be live!   ```

**❌ "Service Unavailable" or slow response**

- Render free tier spins down after 15 min inactivity4. You'll get a URL like: `careflow-frontend.vercel.app`   VITE_API_BASE = https://careflow-backend.onrender.com

- First request wakes it up (~30 seconds)

- Solution: Upgrade to paid plan ($7/month) for always-on5. **📋 Copy this Vercel URL!**   VITE_WS_BASE = wss://careflow-backend.onrender.com



**❌ Build failed on Render**   ```

- Check **Logs** tab in Render dashboard

- Common: Missing `PORT` environment variable---

- Verify all env vars are set correctly

6. **Click "Deploy site"**

**❌ MongoDB Connection Error**

- Go to MongoDB Atlas → **Network Access**## Part 3: Connect Frontend & Backend 🔗   - Wait for deployment (2-3 minutes)

- Ensure `0.0.0.0/0` is allowed

- Check connection string password   - Note your frontend URL: `https://your-site-name.netlify.app`



### Frontend Issues### 3.1 Update Backend Environment Variables



**❌ Firebase deploy fails**Go back to **Railway** → Your Project → **Variables** → Add these **two new** variables:### Part 4: Update Backend CORS Settings

```bash

# Re-authenticate

firebase logout

firebase login```bash1. Go back to **Render dashboard**



# Try againDJANGO_ALLOWED_HOSTS=your-railway-url.up.railway.app2. Update the `CORS_ALLOWED_ORIGINS` environment variable:

firebase deploy --only hosting

```CORS_ALLOWED_ORIGINS=https://your-vercel-url.vercel.app,http://localhost:5173   ```



**❌ "Cannot connect to backend"**```   CORS_ALLOWED_ORIGINS = https://your-actual-site-name.netlify.app

- Check `.env.production` has correct Render URL

- Rebuild: `npm run build`   ```

- Redeploy: `firebase deploy --only hosting`

**Replace** with your actual URLs:3. Click "Save" - this will trigger a redeploy

**❌ CORS Error**

- Verify `CORS_ALLOWED_ORIGINS` in Render includes Firebase URL with `https://`- `your-railway-url.up.railway.app` ← Railway domain (no `https://`)

- No trailing slash!

- `your-vercel-url.vercel.app` ← Vercel domain (include `https://`)## ✅ Verification

---



## 📊 Cost Breakdown

Example:1. **Visit your frontend URL**: `https://your-site-name.netlify.app`

| Service | Plan | Limits | Cost |

|---------|------|--------|------|```bash2. **Test Registration**: Create a new admin account

| **Render** | Free | 750 hrs/month, spins down | **$0** |

| **Firebase Hosting** | Spark | 10GB storage, 360MB/day bandwidth | **$0** |DJANGO_ALLOWED_HOSTS=careflow-production-abc123.up.railway.app3. **Test Hospital Creation**: Add a hospital

| **MongoDB Atlas** | M0 | 512MB storage | **$0** |

| **Total** | | | **$0/month** ✅ |CORS_ALLOWED_ORIGINS=https://careflow-frontend.vercel.app,http://localhost:51734. **Test Real-time Features**: Connect WebSocket and add patients



### Render Free Tier Limits:```

- ✅ 750 hours/month (enough for 1 service)

- ⚠️ Spins down after 15 minutes inactivity## 🔧 Troubleshooting

- ⚠️ 30-second cold start on first request

- **Upgrade:** $7/month for always-on### 3.2 Wait for Auto-Redeploy



### Firebase Hosting Limits:Railway will automatically redeploy when you change variables (~30 seconds).### Backend Issues:

- ✅ 10GB storage

- ✅ 360MB/day bandwidth (~10.8GB/month)- Check Render logs: Dashboard → Your Service → Logs

- ✅ Global CDN

- ✅ Auto SSL---- Ensure all environment variables are set correctly

- **Upgrade:** Blaze plan (pay-as-you-go)

- Verify MongoDB connection string is correct

---

## Part 4: Test Your Deployment ✅

## 🚀 Quick Deploy Commands

### Frontend Issues:

### Backend (Render)

```bash### 4.1 Test Backend- Check Netlify deploy logs

# Just push to GitHub - Render auto-deploys!

git add .```bash- Verify `VITE_API_BASE` points to your Render backend URL

git commit -m "Deploy to Render"

git push origin main# Should return empty array or existing hospitals- Check browser console for CORS errors

```

curl https://your-railway-url.up.railway.app/api/hospitals/

### Frontend (Firebase)

```bash### CORS Errors:

cd frontend

# Test auth endpoint- Ensure `CORS_ALLOWED_ORIGINS` in Render includes your Netlify URL

# Update backend URL in .env.production first!

# Then build and deploy:curl https://your-railway-url.up.railway.app/api/auth/profile/- Make sure to include `https://` in the URLs

npm run build

firebase deploy --only hosting# Should return: {"detail":"Authentication credentials were not provided."}- Redeploy backend after updating CORS settings

```

```

---

## 📝 Post-Deployment

## 🔐 Security Checklist

### 4.2 Test Frontend

- [x] `DEBUG=false` in production

- [x] Strong `SECRET_KEY` (50+ characters)1. Open your Vercel URL: `https://your-vercel-url.vercel.app`### Create Admin User (via Render Shell):

- [x] `ALLOWED_HOSTS` restricted

- [x] `CORS_ALLOWED_ORIGINS` restricted2. You should see the **CareFlow login page** with animated background1. Go to Render Dashboard → Your Service → Shell

- [x] MongoDB password secure

- [x] JWT authentication enabled3. Click **"Register"**2. Run:

- [x] Rate limiting: 30/min (anon), 120/min (auth)

- [x] HTTPS enforced (automatic)4. Create account: username, email, password (min 8 chars)   ```bash



---5. You should be logged in and see the dashboard!   python manage.py createsuperuser



## 📝 Post-Deployment   ```



### Custom Domain (Optional)### 4.3 Test Full Flow3. Follow prompts to create admin account



**Firebase Hosting:**1. **Create Hospital:** Manage tab → Hospital form

1. Firebase Console → Hosting → **Add custom domain**

2. Follow DNS setup instructions2. **Create Department:** Select hospital → Department form### Custom Domain (Optional):

3. Free SSL certificate auto-provisioned

3. **Add Patient:** Queue form → Fill patient details- **Netlify**: Settings → Domain management → Add custom domain

**Render:**

1. Render Dashboard → Settings → **Custom Domain**4. **Monitor:** Dashboard tab → See live stats- **Render**: Settings → Custom domain

2. Add your domain (e.g., `api.yourdomain.com`)

3. Update DNS with CNAME record5. **WebSocket Test:** Open DevTools Console → Look for "🔌 WebSocket: connected"

4. Free SSL via Let's Encrypt

## 🎉 You're Live!

### Keep Render Service Awake

Create a cron job or use services like:---

- **UptimeRobot** (free): Ping your Render URL every 5 minutes

- **Cron-job.org** (free): Schedule HTTP requestsYour CareFlow application is now deployed and accessible worldwide!



---## 🔧 Troubleshooting



## 🆘 Common Issues- **Frontend**: https://your-site-name.netlify.app



### Render service keeps sleeping### Backend Issues- **Backend API**: https://careflow-backend.onrender.com/api/

**Solution:** Use UptimeRobot to ping `/api/hospitals/` every 5 minutes

- **Admin Panel**: https://careflow-backend.onrender.com/admin/

### Firebase deploy fails with auth error

```bash**❌ "Application failed to respond"**

firebase logout

firebase login --reauth- Check Railway logs: Project → **Deployments** → Latest → **View Logs**## 💡 Tips

```

- Look for: `ModuleNotFoundError`, `SECRET_KEY` errors, or MongoDB connection failures

### Backend takes 30+ seconds to respond

- Normal for Render free tier after sleep- Free tier services may sleep after 15 mins of inactivity

- Service wakes up on first request

- Subsequent requests are fast**❌ "500 Internal Server Error"**- First request after sleeping takes ~30 seconds to wake up



---```bash- Upgrade to paid tiers for always-on service and better performance



## ✅ Success! Your URLs# Check if all environment variables are set:- Monitor your MongoDB Atlas usage (free tier has 512MB limit)



**Frontend (share with users):**- DJANGO_SECRET_KEY ✓

```- MONGO_URL ✓

https://careflow-hospital.web.app- MONGO_DB_NAME ✓

```- PORT ✓

```

**Backend API:**

```**❌ MongoDB Connection Failed**

https://careflow-backend.onrender.com- Go to MongoDB Atlas → **Network Access**

```- Ensure `0.0.0.0/0` (allow from anywhere) is enabled

- Verify connection string has correct password

**Django Admin:**

```### Frontend Issues

https://careflow-backend.onrender.com/admin/

```**❌ "Network Error" or "Cannot connect to backend"**

- Open DevTools → **Console** tab

---- Check if requests are going to correct Railway URL

- Verify `VITE_API_BASE` in Vercel: Settings → Environment Variables

## 🎉 Deployment Complete!

**❌ CORS Error: "blocked by CORS policy"**

You now have:- Go to Railway → **Variables**

- ✨ React frontend on Firebase (global CDN)- Check `CORS_ALLOWED_ORIGINS` includes your **exact** Vercel URL with `https://`

- 🔐 Secure Django backend on Render- No trailing slash!

- 🗄️ MongoDB Atlas database- Example: `https://careflow-frontend.vercel.app` ✅

- 🔒 JWT authentication- Wrong: `https://careflow-frontend.vercel.app/` ❌

- 📡 Real-time WebSocket updates

- 💰 **100% FREE hosting!****❌ "401 Unauthorized" after login**

- Clear browser cache: DevTools → Application → Clear storage

**Note:** Render free tier spins down after inactivity. First request after sleep takes ~30 seconds to wake up. For always-on service, upgrade to Render's paid plan ($7/month).- Try registering a new user

- Check Railway logs for JWT errors

---

**❌ Blank page / White screen**

**Questions?** Check troubleshooting section above!- Check browser Console for errors

- Verify build completed successfully in Vercel
- Try: Vercel Dashboard → Deployments → Latest → **Redeploy**

---

## 📊 Cost Breakdown

| Service | Plan | Storage | Bandwidth | Cost |
|---------|------|---------|-----------|------|
| **Railway** | Hobby | - | - | **$5 credit/month** |
| **Vercel** | Hobby | 100GB | ∞ | **$0** |
| **MongoDB Atlas** | M0 Free | 512MB | - | **$0** |
| **Total** | | | | **$0/month** ✅ |

### Railway Usage Estimates:
- **Small app (10-100 users):** ~$3-5/month (within free credits)
- **Medium app (100-500 users):** ~$10-15/month
- If you exceed $5 free credit, Railway charges $0.000231/GB-hour

---

## 🎯 Alternative: CLI Deployment

### Option A: Railway CLI
```bash
# Install
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up

# Add variables via CLI
railway variables set DJANGO_SECRET_KEY=your-secret-key
railway variables set MONGO_URL=your-mongo-url
railway variables set DJANGO_DEBUG=false
```

### Option B: Vercel CLI
```bash
# Install
npm install -g vercel

# Deploy frontend
cd frontend
vercel login
vercel --prod

# Set environment variables
vercel env add VITE_API_BASE production
# Paste your Railway URL when prompted
```

---

## 🔐 Production Security Checklist

- [x] `DEBUG=false` in production
- [x] Strong `SECRET_KEY` (50+ characters, random)
- [x] `ALLOWED_HOSTS` restricted to your Railway domain
- [x] `CORS_ALLOWED_ORIGINS` restricted to your Vercel domain
- [x] MongoDB password is strong (already set in connection string)
- [x] JWT authentication enabled
- [x] Rate limiting: 30 req/min (anonymous), 120 req/min (authenticated)
- [x] HTTPS enforced (automatic on Railway & Vercel)
- [x] Security headers set (X-Frame-Options, CSP, etc.)
- [x] Request logging enabled

---

## 📝 Post-Deployment Tasks

### 1. Monitor Your Apps
- **Railway Logs:** https://railway.app/project/YOUR_PROJECT/deployments
- **Vercel Analytics:** https://vercel.com/YOUR_PROJECT/analytics

### 2. Create Admin User (Optional)
```bash
# In Railway dashboard → Your Project → Terminal (or use Railway CLI):
python manage.py createsuperuser

# Then access Django admin at:
# https://your-railway-url.up.railway.app/admin/
```

### 3. Set Up Custom Domain (Optional)

**For Frontend (Vercel):**
1. Buy domain (e.g., from Namecheap, Google Domains)
2. Vercel Dashboard → Settings → **Domains** → Add `careflow.yourdomain.com`
3. Update DNS with Vercel's nameservers

**For Backend (Railway):**
1. Railway Dashboard → Settings → **Networking** → **Custom Domains**
2. Add `api.yourdomain.com`
3. Update DNS with Railway's CNAME

**Update CORS after custom domain:**
```bash
CORS_ALLOWED_ORIGINS=https://careflow.yourdomain.com,http://localhost:5173
```

---

## 🚀 Performance Optimization

### Backend (Railway)
- **Increase workers:** Change Procfile to `--workers 4` for more traffic
- **Enable Redis:** Add Redis service in Railway for session caching
- **Database indexing:** MongoDB Atlas → Collections → Create indexes on frequently queried fields

### Frontend (Vercel)
- **Already optimized!** Vercel automatically:
  - Compresses assets with Brotli
  - Serves via global CDN
  - Caches static assets forever
  - Lazy-loads components

---

## 🆘 Getting Help

### Check Logs First
**Railway:** Project → Deployments → Click latest → **View Logs**  
**Vercel:** Project → Deployments → Click latest → **Building** → **Runtime Logs**

### Common Fixes
```bash
# Railway: Force redeploy
# Dashboard → Deployments → ⋮ menu → Redeploy

# Vercel: Force redeploy
# Dashboard → Deployments → Latest → ⋮ menu → Redeploy

# Clear Railway build cache
# Settings → Delete Service → Create new service (re-import from GitHub)

# Verify environment variables are set
# Railway: Variables tab → should have 6-7 variables
# Vercel: Settings → Environment Variables → should have VITE_API_BASE
```

### Still Stuck?
1. Check Railway Discord: https://discord.gg/railway
2. Check Vercel Discord: https://discord.gg/vercel
3. Review Django logs for error stack traces
4. Test backend locally with production settings:
   ```bash
   export DJANGO_DEBUG=false
   export DJANGO_SETTINGS_MODULE=hospital_queue.settings
   python manage.py runserver
   ```

---

## ✅ Success Indicators

If everything is working:

✨ **Frontend:**
- Login page loads with animated gradients
- Can register new user
- Dashboard shows hospital stats
- Real-time updates work (WebSocket connected)

🔐 **Backend:**
- `/api/hospitals/` returns JSON (even if empty)
- `/api/auth/profile/` returns 401 (authentication required)
- Railway logs show: `Starting gunicorn`
- No error 500s in logs

🗄️ **Database:**
- MongoDB Atlas shows new collections: `hospitals`, `departments`, `beds`, `queue`
- Documents appear after creating via frontend

---

## 🎉 Deployment Complete!

You now have a **fully secure, production-ready** hospital queue management system:

- ✅ **Frontend:** Beautiful React SPA on Vercel global CDN
- ✅ **Backend:** Secure Django REST API on Railway
- ✅ **Database:** MongoDB Atlas (cloud-hosted, replicated)
- ✅ **Authentication:** JWT tokens with refresh & blacklisting
- ✅ **Real-time:** WebSocket updates for live status
- ✅ **Security:** HTTPS, CORS, rate limiting, security headers
- ✅ **Free hosting:** $0/month within free tiers!

**Your app is live at:**
- 🌐 Frontend: `https://your-vercel-url.vercel.app`
- 🔧 Backend API: `https://your-railway-url.up.railway.app`

Share the frontend URL with your users and enjoy! 🚀

---

**Questions?** Check the troubleshooting section above or review the logs in Railway/Vercel dashboards.
