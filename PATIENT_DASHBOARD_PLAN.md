# Patient Dashboard - Implementation Plan

## Overview
Create a separate patient-facing dashboard where patients can register, book appointments with payment, and view queue status. All patient bookings will be visible on the hospital admin dashboard.

## Features

### 1. Patient Authentication
- ✅ Patient registration (public)
- ✅ Patient login
- ✅ Forgot password functionality
- ✅ Role-based access control (admin vs patient)

### 2. Patient Dashboard Features
- View available appointment slots
- Book appointments (requires payment)
- View current queue status
- See estimated wait time
- View personal appointment history
- Cancel upcoming appointments (with refund policy)

### 3. Hospital Admin Dashboard Features (Enhanced)
- View all patient appointments
- See patient details for each appointment
- Mark appointments as completed
- View payment status
- Manage appointment slots

### 4. Payment Integration
- Payment gateway integration (Razorpay/Stripe)
- Payment amount configuration per appointment type
- Payment status tracking (pending/paid/refunded)
- Payment receipts

## Database Schema

### User Model (Enhanced)
```python
- username
- email
- password
- role: 'admin' | 'patient'
- first_name
- last_name
- phone
- date_of_birth
- address
- blood_group
- emergency_contact
```

### Appointment Model (Enhanced)
```python
- patient (FK to User)
- hospital (FK to Hospital)
- department (FK to Department)
- appointment_slot (FK to AppointmentSlot)
- symptoms
- status: 'pending_payment' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
- payment_status: 'pending' | 'paid' | 'refunded'
- payment_amount
- payment_id
- payment_date
- created_at
- updated_at
```

### Payment Model
```python
- appointment (FK to Appointment)
- patient (FK to User)
- amount
- payment_gateway: 'razorpay' | 'stripe'
- transaction_id
- status: 'pending' | 'success' | 'failed' | 'refunded'
- created_at
- updated_at
```

## User Flows

### Patient Flow
1. Register/Login → Patient Dashboard
2. Browse available appointment slots
3. Select slot → Enter details → Pay
4. Payment successful → Appointment confirmed
5. View in "My Appointments"
6. Check queue status anytime

### Hospital Admin Flow
1. Login with admin credentials (anurag2908@gmail.com / Anurag2908)
2. See all bookings on dashboard
3. View patient details for each appointment
4. Manage appointment status
5. View payment information

## Technical Implementation

### Backend Changes
1. Add `role` field to User model
2. Create Appointment model
3. Create Payment model
4. Add payment API endpoints
5. Add appointment booking endpoints
6. Add queue status endpoints
7. Add forgot password endpoints

### Frontend Changes
1. Create Patient Dashboard (separate route)
2. Create appointment booking flow
3. Integrate payment gateway
4. Add queue status view
5. Add forgot password flow
6. Keep Hospital Dashboard (restrict to admins)

## API Endpoints

### Patient APIs
- POST `/api/patient/register/` - Register as patient
- POST `/api/patient/login/` - Patient login
- POST `/api/patient/forgot-password/` - Request password reset
- POST `/api/patient/reset-password/` - Reset password
- GET `/api/patient/appointments/` - My appointments
- GET `/api/patient/available-slots/` - Available slots
- POST `/api/patient/book-appointment/` - Book appointment
- POST `/api/patient/payment/` - Process payment
- GET `/api/patient/queue-status/:hospital_id/` - Queue status

### Admin APIs (existing + new)
- GET `/api/admin/appointments/` - All appointments
- GET `/api/admin/patients/` - All patients
- PATCH `/api/admin/appointment/:id/status/` - Update status

## Payment Integration Options

### Option 1: Razorpay (Recommended for India)
- Easy integration
- Supports UPI, cards, wallets
- Good documentation

### Option 2: Stripe
- International standard
- More features
- Higher fees

### Option 3: Test Mode (for development)
- Mock payment
- No actual charges
- Good for testing

## Security Considerations
1. Role-based access control
2. Payment verification
3. Secure password reset tokens
4. Rate limiting on APIs
5. HTTPS only for production

## Next Steps
1. Update User model with role field
2. Create Appointment and Payment models
3. Implement payment integration
4. Build patient dashboard UI
5. Update hospital dashboard to show patient bookings
6. Test end-to-end flow
