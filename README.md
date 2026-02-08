# 🏥 CareFlow - Smart Hospital Queue Management System

A modern, real-time hospital queue and bed management system built with Django Channels, React, and MongoDB.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 🏥 **Hospital Management** - Multi-hospital support with departments
- 🛏️ **Bed Tracking** - Real-time bed status (Available, Occupied, Cleaning, Maintenance)
- 👥 **Patient Queue** - Smart queue management with ETA predictions
- 📊 **Analytics Dashboard** - Visual insights into hospital operations
- 🔄 **Real-time Updates** - WebSocket-powered live data synchronization
- 📱 **Patient View** - Self-service queue status lookup
- 🌐 **RESTful API** - Complete API for mobile app integration

## 🛠️ Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **MongoDB Atlas** - Cloud database
- **Redis** - Channel layer (optional)
- **JWT** - Authentication

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Framer Motion** - Animations

## 🚀 Quick Start

### Prerequisites
- Python 3.14+
- Node.js 20+
- MongoDB Atlas account

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Deploy to production
- **Backend README**: `backend/README.md`
- **Frontend README**: `frontend/README.md`

## 🔑 Environment Variables

### Backend `.env`
```bash
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
MONGO_URL=mongodb+srv://...
MONGO_DB_NAME=careflow
CORS_ALLOWED_ORIGINS=http://localhost:5173
REDIS_URL=  # Optional
```

### Frontend `.env`
```bash
VITE_API_BASE=http://localhost:8000
VITE_WS_BASE=ws://localhost:8000
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/refresh/` - Refresh token
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/profile/` - Get user profile

### Hospital Management
- `GET/POST /api/hospitals/` - List/Create hospitals
- `GET/POST /api/departments/` - List/Create departments
- `GET/POST /api/beds/` - List/Create beds
- `PATCH /api/beds/{id}/` - Update bed status

### Queue Management
- `GET/POST /api/queue/` - List/Add patients
- `POST /api/queue/{id}/start/` - Start visit
- `POST /api/queue/{id}/complete/` - Complete visit
- `GET /api/patient/queue/{id}/` - Patient status lookup

### Analytics
- `GET /api/dashboard/{hospital_id}/` - Dashboard metrics
- `GET /api/status/{hospital_id}/` - Hospital status snapshot

### WebSocket
- `ws://localhost:8000/ws/hospitals/{hospital_id}/` - Real-time updates

## 🎨 UI Screenshots

*Modern, beautiful dark-themed interface with real-time updates*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ by Anurag Rokade

## 🙏 Acknowledgments

- Django & Django Channels team
- React & Vite communities
- MongoDB Atlas
- All open-source contributors

---

**⭐ Star this repo if you find it useful!**
