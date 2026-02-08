# Patient Dashboard - Implementation Progress

## ✅ Completed Steps

### 1. Database Models Updated
- ✅ **User Model Enhanced**
  - Added `role` field ('admin' or 'patient')
  - Added patient details (first_name, last_name, phone, date_of_birth, address, blood_group, emergency_contact)
  - Added helper methods: `is_admin`, `is_patient`, `full_name`
  
- ✅ **Appointment Model Created**
  - Links patient to appointment slots
  - Tracks payment status
  - Multiple statuses: pending_payment, confirmed, in_progress, completed, cancelled
  - Methods: `confirm_payment()`, `cancel()`, `mark_in_progress()`, `mark_completed()`

- ✅ **Payment Model Created**
  - Tracks payment transactions
  - Supports multiple gateways (Razorpay, Stripe, Test)
  - Payment status tracking
  - Methods: `mark_success()`, `mark_failed()`, `mark_refunded()`

### 2. Database Migrations
- ✅ Created and applied migration `0003_user_address_user_blood_group...`
- ✅ All new fields added to database

### 3. Admin User Created
- ✅ Username: `anurag2908@gmail.com`
- ✅ Password: `Anurag2908`  
- ✅ Role: `admin`
- ✅ Can access hospital dashboard

## 🚧 Next Steps

### Phase 1: Backend APIs (Priority)

#### 1.1 Patient Authentication APIs
Create file: `backend/queueing/patient_views.py`

```python
# Endpoints needed:
- POST /api/patient/register/
- POST /api/patient/login/
- POST /api/patient/forgot-password/
- POST /api/patient/reset-password/
- GET /api/patient/profile/
```

#### 1.2 Appointment Booking APIs
```python
# Endpoints needed:
- GET /api/patient/available-slots/?hospital_id=X&department_id=Y&date=YYYY-MM-DD
- POST /api/patient/book-appointment/
  {
    "hospital_id": 1,
    "department_id": 2,
    "appointment_slot_id": 3,
    "symptoms": "...",
    "notes": "..."
  }
- GET /api/patient/my-appointments/
- DELETE /api/patient/appointments/:id/cancel/
```

#### 1.3 Payment APIs
```python
# Endpoints needed:
- POST /api/patient/payment/initiate/
  {
    "appointment_id": 123,
    "amount": 500.00,
    "gateway": "test"  # or "razorpay" later
  }
  Returns: { order_id, transaction_id }

- POST /api/patient/payment/verify/
  {
    "transaction_id": "...",
    "payment_id": "...",
    "signature": "..."
  }
  Confirms payment and updates appointment

- POST /api/patient/payment/callback/
  # Webhook endpoint for gateway
```

#### 1.4 Queue Status APIs
```python
# Endpoints needed:
- GET /api/patient/queue-status/:hospital_id/
  Returns: {
    "total_waiting": 15,
    "average_wait_time_minutes": 45,
    "current_queue": [...]
  }
```

#### 1.5 Hospital Admin APIs (Enhanced)
```python
# Endpoints needed:
- GET /api/admin/appointments/
  # View all patient appointments
- GET /api/admin/appointments/:id/
  # View appointment details with patient info
- PATCH /api/admin/appointments/:id/status/
  # Update appointment status (in_progress, completed)
```

### Phase 2: Frontend - Patient Dashboard

#### 2.1 Create Patient Dashboard Pages
Create directory: `frontend/src/pages/patient/`

**Pages needed:**
1. `PatientAuth.jsx` - Login/Register/Forgot Password
2. `PatientDashboard.jsx` - Main dashboard
3. `BookAppointment.jsx` - Book appointment flow
4. `MyAppointments.jsx` - View my appointments
5. `QueueStatus.jsx` - View current queue
6. `PaymentPage.jsx` - Payment processing

#### 2.2 Update Routing
In `frontend/src/App.jsx`:
```javascript
// Add routes:
/patient/login
/patient/dashboard
/patient/book-appointment
/patient/my-appointments
/patient/queue-status
/patient/payment

// Existing admin routes:
/admin/login  // Restricted to admin role
/admin/dashboard
```

#### 2.3 Update Hospital Dashboard
- Add "Appointments" tab
- Show list of patient appointments
- Display patient details for each appointment
- Add actions: Mark In Progress, Mark Completed

### Phase 3: Payment Integration

#### 3.1 Test Mode (Quick Start)
- Create mock payment that always succeeds
- Use for development and testing
- No actual money transferred

#### 3.2 Razorpay Integration (Production)
```python
# Install:
pip install razorpay

# Settings:
RAZORPAY_KEY_ID = 'your_key_id'
RAZORPAY_KEY_SECRET = 'your_key_secret'

# Implementation in payment_views.py
```

### Phase 4: Additional Features

#### 4.1 Email Notifications
- Appointment confirmation
- Payment receipt
- Appointment reminders
- Forgot password link

#### 4.2 SMS Notifications (Optional)
- Send queue position updates
- Send when appointment is ready

#### 4.3 Admin Features
- Configure appointment pricing
- Manage appointment slots
- View analytics (revenue, bookings)

## 📊 Current System State

### Database Schema
```
User (role: admin | patient)
├── Appointments (patient bookings)
│   └── Payment Transactions
├── Hospitals
│   ├── Departments
│   ├── Beds
│   ├── Queue Entries
│   └── Appointment Slots
```

### User Roles
- **Admin**: Full access to hospital dashboard (existing)
- **Patient**: Access to patient dashboard (to be built)

### Access Control
- Admin: `anurag2908@gmail.com` / `Anurag2908`
- Patients: Public registration (to be implemented)

## 🎯 Immediate Next Steps (In Order)

1. ✅ **Create backend API file structure**
   - Create `patient_views.py`
   - Create `payment_views.py`
   - Create `admin_views.py` (enhance existing)

2. ✅ **Implement Test Mode Payment**
   - Simple payment that always succeeds
   - No external dependencies
   - Good for MVP

3. ✅ **Create Patient Dashboard UI**
   - Start with authentication pages
   - Then booking flow
   - Then appointments list

4. ✅ **Integrate with Hospital Dashboard**
   - Add appointments tab
   - Show patient bookings

5. ✅ **Test End-to-End**
   - Patient registers → books appointment → pays → admin sees it

6. ✅ **Deploy and Test**

Would you like me to start implementing any of these phases? I recommend starting with:
1. Backend APIs (Phase 1) - This will give you the foundation
2. Test Mode Payment - Quick wins
3. Patient Dashboard UI - User-facing features

Let me know which part you'd like me to build first!
