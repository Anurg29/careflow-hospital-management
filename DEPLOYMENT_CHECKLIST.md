# 🚀 CareFlow Deployment Checklist

Follow these steps in order to deploy your application to production.

## ✅ Pre-Deployment Checklist

- [x] Code is working locally
- [x] All dependencies are in requirements.txt and package.json
- [x] Environment variables are documented
- [x] .gitignore is configured
- [x] Git repository initialized
- [x] Initial commit created
- [ ] GitHub repository created
- [ ] Code pushed to GitHub

## 📝 Step-by-Step Deployment

### Step 1: Push to GitHub (5 minutes)

1. Go to https://github.com/new
2. Create a repository named: `careflow-hospital-management`
3. Don't initialize with README (we have code already)
4. Copy the commands shown and run in terminal:
   ```bash
   cd /Users/anuragdineshrokade/Documents/doctor
   git remote add origin https://github.com/YOUR_USERNAME/careflow-hospital-management.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy Backend to Render (15 minutes)

1. Sign up at https://render.com (use GitHub login)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select repository: `careflow-hospital-management`
5. Configure:
   - **Name**: `careflow-backend`
   - **Region**: Oregon (US West)
   - **Root Directory**: `backend`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn hospital_queue.asgi:application -k uvicorn.workers.UvicornWorker`
   - **Plan**: Free
6. Add these environment variables:
   ```
   DJANGO_SECRET_KEY = (click Generate)
   DJANGO_DEBUG = false
   DJANGO_ALLOWED_HOSTS = careflow-backend.onrender.com
   MONGO_URL = mongodb+srv://anuragrokade965:anurag29@cluster1.1mvedwk.mongodb.net/?appName=Cluster1
   MONGO_DB_NAME = careflow
   CORS_ALLOWED_ORIGINS = (leave blank for now)
   ```
7. Click "Create Web Service"
8. **WAIT** for deployment to complete (~10 mins)
9. **SAVE YOUR URL**: `https://careflow-backend.onrender.com`

### Step 3: Deploy Frontend to Netlify (10 minutes)

1. Sign up at https://netlify.com (use GitHub login)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select: `careflow-hospital-management`
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables:
   ```
   VITE_API_BASE = https://careflow-backend.onrender.com
   VITE_WS_BASE = wss://careflow-backend.onrender.com
   ```
6. Click "Deploy site"
7. **WAIT** for deployment (~3 mins)
8. **SAVE YOUR URL**: `https://your-site-name.netlify.app`

### Step 4: Update CORS Settings (2 minutes)

1. Go back to Render dashboard
2. Find your `careflow-backend` service
3. Go to "Environment" tab
4. Update `CORS_ALLOWED_ORIGINS`:
   ```
   CORS_ALLOWED_ORIGINS = https://your-actual-site-name.netlify.app
   ```
5. Click "Save" (this triggers auto-redeploy)
6. Wait for redeploy to complete

### Step 5: Test Your Deployment (5 minutes)

1. Visit your Netlify URL
2. Register a new admin account
3. Create a hospital
4. Add departments and beds
5. Test queue management
6. Verify WebSocket connection works

## 🎉 Deployment Complete!

Your URLs:
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend API**: `https://careflow-backend.onrender.com/api/`
- **Admin Panel**: `https://careflow-backend.onrender.com/admin/`

## 🔧 Post-Deployment Tasks

### Optional: Create Superuser via Render Shell
1. Go to Render → Your Service → Shell (top right)
2. Run: `python manage.py createsuperuser`
3. Follow prompts

### Optional: Custom Domain
- Netlify: Settings → Domain management → Add custom domain
- Render: Settings → Custom domain → Add your domain

## ⚠️ Important Notes

1. **Free tier services sleep after 15 mins** - First request takes ~30 seconds
2. **MongoDB free tier limit**: 512MB storage
3. **Render free tier**: 750 hours/month (enough for 1 service 24/7)
4. **Keep credentials secure** - Never commit .env files

## 📞 Need Help?

Check the full [DEPLOYMENT.md](DEPLOYMENT.md) guide for detailed troubleshooting.

## ✅ Final Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Netlify
- [ ] CORS configured correctly
- [ ] Can register and login
- [ ] Can create hospitals
- [ ] WebSocket connects properly
- [ ] All features working

---

**Total Time**: ~35 minutes
**Cost**: $0 (Free tier)
