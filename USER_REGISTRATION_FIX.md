# User Registration Fix Summary

## Problem
User registration was not working - the system appeared to hang when trying to register a new user.

## Root Causes Identified

### 1. **Missing AUTH_USER_MODEL Configuration** (Critical)
- **Issue**: The project uses a custom `User` model but didn't declare it as Django's user model
- **Impact**: Django JWT couldn't create tokens because it expected Django's default User model
- **Error**: `ValueError: Cannot assign "<User: username>": "OutstandingToken.user" must be a "User" instance`
- **Fix**: 
  - Updated `User` model to inherit from `AbstractBaseUser` and `PermissionsMixin`
  - Added `UserManager` for user creation
  - Added `AUTH_USER_MODEL = 'queueing.User'` to settings.py
  - Recreated database migrations

### 2. **MongoDB Connection Blocking Registration** (Critical)
- **Issue**: MongoDB sync signals were blocking user registration when MongoDB connection failed
- **Impact**: Registration requests would hang indefinitely due to SSL certificate issues
- **Fix**: 
  - Added connection timeouts (5 seconds) to MongoClient
  - Modified `get_mongo_db()` to return `None` instead of raising errors
  - Added graceful error handling in MongoDB sync operations
  - Now users can register even if MongoDB is unavailable

### 3. **Frontend Token Handling Mismatch** (Important)
- **Issue**: Login function was accessing `data.access` and `data.refresh` instead of `data.tokens.access` and `data.tokens.refresh`
- **Impact**: Login would fail to store tokens properly
- **Fix**: Updated `client.js` line 133 to correctly access tokens from the nested object

## Files Modified

### Backend
1. `/backend/hospital_queue/settings.py`
   - Added `AUTH_USER_MODEL = 'queueing.User'` configuration

2. `/backend/queueing/models.py`
   - Converted `User` model to inherit from `AbstractBaseUser` and `PermissionsMixin`
   - Added `UserManager` class for user management
   - Added `USERNAME_FIELD` and `REQUIRED_FIELDS` attributes

3. `/backend/queueing/mongo.py`
   - Added `serverSelectionTimeoutMS=5000` and `connectTimeoutMS=5000` to prevent hanging
   - Modified `get_mongo_db()` to return `None` on connection failure

4. `/backend/queueing/mongo_sync.py`
   - Added null check for MongoDB database before syncing
   - Sync operations now fail gracefully without blocking main operations

### Frontend
1. `/frontend/src/api/client.js`
   - Fixed login function to correctly access `data.tokens.access` and `data.tokens.refresh`

## Testing Results

✅ **Registration**: Successfully creates users and returns JWT tokens
✅ **Login**: Successfully authenticates and returns JWT tokens  
✅ **MongoDB Sync**: Fails gracefully with warnings, doesn't block operations
✅ **Backend Server**: Runs without errors

## Current Status

- **User Registration**: ✅ WORKING
- **User Login**: ✅ WORKING  
- **JWT Authentication**: ✅ WORKING
- **MongoDB Sync**: ⚠️ Failing due to SSL certificate issues (non-blocking)

## MongoDB SSL Issue (Optional Fix)

The MongoDB sync is currently failing with SSL certificate verification errors. To fix this (optional):

```python
# In mongo.py, add tlsAllowInvalidCertificates parameter:
_client = MongoClient(
    uri,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    tlsAllowInvalidCertificates=True  # Only for development!
)
```

**Note**: Only use `tlsAllowInvalidCertificates` in development. For production, install proper SSL certificates.

## Next Steps

1. ✅ Backend is running on http://127.0.0.1:8000
2. ✅ Frontend is running on http://localhost:5173
3. Users can now successfully register and login
4. (Optional) Fix MongoDB SSL certificate issue if you want to enable MongoDB syncing
