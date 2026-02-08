# Deploy CareFlow Backend to Azure App Service

## 📋 Prerequisites

- Azure Account (free tier available - $200 credit for 30 days)
- GitHub repository ready (✅ already done)
- Azure CLI installed (optional but helpful)

## 🚀 Deployment Steps

### Method 1: Using Azure Portal (Recommended - Easier)

#### Step 1: Create Azure App Service

1. **Go to Azure Portal:**
   - Visit: https://portal.azure.com
   - Sign in with your Microsoft account

2. **Create Web App:**
   - Click **"Create a resource"**
   - Search for **"Web App"**
   - Click **"Create"**

3. **Configure Basic Settings:**
   ```
   Subscription: (Your subscription)
   Resource Group: Create new → "careflow-rg"
   Name: careflow-backend (must be globally unique)
   Publish: Code
   Runtime stack: Python 3.11
   Region: (Choose closest to you)
   Pricing Plan: Free F1 (or Basic B1 for production)
   ```

4. **Click "Review + Create"** → **"Create"**
   - Wait for deployment (~2 minutes)

#### Step 2: Configure Deployment

1. **Go to your Web App** in Azure Portal

2. **Deployment Center:**
   - Left menu → **"Deployment Center"**
   - Source: **GitHub**
   - Authorize and select:
     - Organization: Your GitHub username
     - Repository: **careflow-hospital-management**
     - Branch: **main**
   - Click **"Save"**

3. **Configure Build:**
   - Build Provider: **App Service Build Service**
   - Root directory: **backend**

#### Step 3: Add Environment Variables

1. **Go to Configuration:**
   - Left menu → **"Configuration"**
   - Click **"New application setting"**

2. **Add these settings one by one:**

   ```
   Name: DJANGO_SECRET_KEY
   Value: (generate a random 50-character string)
   
   Name: DJANGO_DEBUG
   Value: false
   
   Name: DJANGO_ALLOWED_HOSTS
   Value: careflow-backend.azurewebsites.net
   
   Name: MONGO_URL
   Value: mongodb+srv://anuragrokade965:anurag29@cluster1.1mvedwk.mongodb.net/?appName=Cluster1
   
   Name: MONGO_DB_NAME
   Value: careflow
   
   Name: CORS_ALLOWED_ORIGINS
   Value: (leave blank for now)
   
   Name: SCM_DO_BUILD_DURING_DEPLOYMENT
   Value: true
   
   Name: POST_BUILD_COMMAND
   Value: python manage.py collectstatic --noinput && python manage.py migrate
   ```

3. **Click "Save"** at the top

#### Step 4: Configure Startup Command

1. **Still in Configuration:**
   - General settings tab
   - Scroll to **"Startup Command"**
   - Enter:
   ```
   gunicorn hospital_queue.asgi:application -k uvicorn.workers.UvicornWorker --bind=0.0.0.0:8000 --timeout 600
   ```

2. **Click "Save"**

#### Step 5: Deploy

1. **Go to Deployment Center:**
   - Click **"Sync"** to trigger manual deployment
   - Or push to GitHub to auto-deploy

2. **Monitor Logs:**
   - Left menu → **"Log stream"**
   - Watch deployment progress

3. **Your backend URL:**
   ```
   https://careflow-backend.azurewebsites.net
   ```

### Method 2: Using Azure CLI (Advanced)

If you have Azure CLI installed:

```bash
# Login to Azure
az login

# Create resource group
az group create --name careflow-rg --location eastus

# Create App Service plan (Free tier)
az appservice plan create --name careflow-plan --resource-group careflow-rg --sku F1 --is-linux

# Create web app
az webapp create --name careflow-backend --resource-group careflow-rg --plan careflow-plan --runtime "PYTHON:3.11"

# Configure deployment from GitHub
az webapp deployment source config --name careflow-backend --resource-group careflow-rg --repo-url https://github.com/Anurg29/careflow-hospital-management --branch main --manual-integration

# Set environment variables
az webapp config appsettings set --name careflow-backend --resource-group careflow-rg --settings \
  DJANGO_SECRET_KEY="your-secret-key-here" \
  DJANGO_DEBUG="false" \
  DJANGO_ALLOWED_HOSTS="careflow-backend.azurewebsites.net" \
  MONGO_URL="mongodb+srv://anuragrokade965:anurag29@cluster1.1mvedwk.mongodb.net/?appName=Cluster1" \
  MONGO_DB_NAME="careflow" \
  SCM_DO_BUILD_DURING_DEPLOYMENT="true"

# Set startup command
az webapp config set --name careflow-backend --resource-group careflow-rg --startup-file "gunicorn hospital_queue.asgi:application -k uvicorn.workers.UvicornWorker --bind=0.0.0.0:8000"
```

## ✅ Verification

1. Visit: `https://careflow-backend.azurewebsites.net/api/`
2. You should see the API endpoints

## 🔧 Troubleshooting

### View Logs:
```bash
az webapp log tail --name careflow-backend --resource-group careflow-rg
```

Or in Portal:
- Left menu → "Log stream"

### Common Issues:

**Issue: Build fails**
- Check that `SCM_DO_BUILD_DURING_DEPLOYMENT=true` is set
- Verify Python version matches (3.11)

**Issue: Static files not loading**
- Ensure `collectstatic` runs in POST_BUILD_COMMAND
- Check STATIC_ROOT in settings.py

**Issue: Port binding error**
- Azure expects port 8000
- Startup command should include `--bind=0.0.0.0:8000`

## 💰 Pricing

- **Free F1 Tier**: 
  - 1 GB RAM
  - 60 CPU minutes/day
  - Good for testing

- **Basic B1** (~$13/month):
  - 1.75 GB RAM
  - Always on
  - Better for production

## 📝 Post-Deployment

After backend is live:

1. **Note your URL**: `https://careflow-backend.azurewebsites.net`

2. **Update CORS** (in Configuration):
   - Add your Netlify URL when frontend is deployed

3. **Create superuser** (using SSH console):
   - In Portal → SSH → `python manage.py createsuperuser`

## 🎉 Next Steps

Once backend is deployed on Azure:
- Deploy frontend to Netlify (same as before)
- Update CORS_ALLOWED_ORIGINS with Netlify URL
- Test the full application

---

**Your Backend URL will be:** `https://careflow-backend.azurewebsites.net`
