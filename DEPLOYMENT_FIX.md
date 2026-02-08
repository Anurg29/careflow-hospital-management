# Deployment Instructions - Update Production Backend

## Current Status
- ✅ **Frontend**: Working on Firebase (https://careflow-hospital.web.app/)
- ❌ **Backend**: Failing on Render (https://careflow-hospital-management.onrender.com)
- **Error**: 500 Internal Server Error on user registration

## Issue
The production backend on Render doesn't have the fixes we just applied locally. Users cannot register or login.

## Solution - Deploy Updated Code to Render

### Step 1: Verify Local Changes
All these files have been updated locally and need to be deployed:
- ✅ `backend/hospital_queue/settings.py` - Added AUTH_USER_MODEL
- ✅ `backend/queueing/models.py` - Updated User model
- ✅ `backend/queueing/mongo.py` - Added timeouts
- ✅ `backend/queueing/mongo_sync.py` - Made sync non-blocking
- ✅ `frontend/src/api/client.js` - Fixed token handling

### Step 2: Commit Changes to Git

```bash
# From the project root directory
cd /Users/anuragdineshrokade/Documents/doctor

# Check what files have changed
git status

# Add all the fixed files
git add backend/hospital_queue/settings.py
git add backend/queueing/models.py
git add backend/queueing/mongo.py
git add backend/queueing/mongo_sync.py
git add frontend/src/api/client.js

# Commit with a clear message
git commit -m "Fix: User registration - Add AUTH_USER_MODEL and fix MongoDB sync blocking"

# Push to your GitHub repository
git push origin main
```

### Step 3: Update Database on Render

⚠️ **IMPORTANT**: Since we changed the User model structure, you need to migrate the database on Render.

**Option A: Reset Database (Recommended for new projects)**
1. Go to Render Dashboard: https://dashboard.render.com
2. Find your backend service: `careflow-hospital-management`
3. Go to "Shell" tab
4. Run these commands:
   ```bash
   cd /opt/render/project/src
   rm db.sqlite3
   python manage.py migrate
   ```

**Option B: Keep Existing Data (Advanced)**
- You would need to manually migrate existing users, but since the model structure changed significantly, this is complex.

### Step 4: Trigger Render Deployment

Render should auto-deploy when you push to GitHub. If not:

1. Go to Render Dashboard
2. Select your backend service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete (watch the logs)

### Step 5: Verify Deployment

After deployment completes:

1. Test the registration endpoint directly:
   ```bash
   curl -X POST 'https://careflow-hospital-management.onrender.com/api/auth/register/' \
     -H 'Content-Type: application/json' \
     -d '{"username":"testuser","email":"test@example.com","password":"TestPass123!","password2":"TestPass123!"}'
   ```

2. Should return 201 with tokens (not 500 error)

3. Test on the live frontend: https://careflow-hospital.web.app/
   - Try registering a new user
   - Should successfully create account and redirect to dashboard

## Frontend Deployment (Already on Firebase)

The frontend code is already on Firebase, but you may want to redeploy to ensure the latest fixes are live:

```bash
cd /Users/anuragdineshrokade/Documents/doctor/frontend

# Build the production version
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

## Expected Results After Deployment

✅ Users can register successfully  
✅ Users can login  
✅ JWT tokens are generated correctly  
✅ MongoDB sync warnings appear but don't block operations  
✅ Full application functionality restored  

## Troubleshooting

If registration still fails after deployment:

1. **Check Render logs**:
   - Go to your service on Render
   - Click "Logs" tab
   - Look for the same errors we saw locally

2. **Verify environment variables**:
   - Ensure `DJANGO_SECRET_KEY` is set
   - Verify `MONGO_URL` (MongoDB can fail gracefully now)
   - Check `CORS_ALLOWED_ORIGINS` includes your Firebase URL

3. **Database migration issues**:
   - If migrations fail, you may need to delete and recreate the database
   - Run `python manage.py showmigrations` to see migration status
