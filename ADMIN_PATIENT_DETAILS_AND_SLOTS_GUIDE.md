# Admin Patient Details & Appointment Slots Guide

## Overview
This guide covers:
1. **Creating appointment slots** so patients can book online
2. **How admins can view patient details** when patients book appointments

---

## Part 1: Creating Appointment Slots

### Why Create Slots?
Without appointment slots, patients will see "No appointment slots available" when trying to book online. Creating slots makes the booking system functional.

### Method 1: Using Management Command (Recommended)

#### Quick Start - Create Slots for All Hospitals
```bash
cd backend
python3 manage.py create_appointment_slots
```

This will:
- Create slots for **all hospitals** and **all departments**
- Generate slots for the **next 7 days**
- Create **10 slots per day** (9 AM - 6 PM, 30-minute intervals)

#### Advanced Options

**Create slots for specific hospital:**
```bash
python3 manage.py create_appointment_slots --hospital-id 1
```

**Create slots for next 14 days:**
```bash
python3 manage.py create_appointment_slots --days 14
```

**Create fewer slots (5 per day):**
```bash
python3 manage.py create_appointment_slots --slots-per-day 5
```

**Combine options:**
```bash
python3 manage.py create_appointment_slots --hospital-id 1 --days 30 --slots-per-day 20
```

#### What Gets Created?
- Start time: 9:00 AM
- Slot duration: 30 minutes
- Slots: 9:00, 9:30, 10:00, 10:30, ... 5:30 PM
- Status: Available (not booked)
- For each department in each hospital

### Method 2: Using Django Shell

```bash
python3 manage.py shell
```

Then:
```python
from django.utils import timezone
from datetime import datetime, timedelta
from queueing.models import Hospital, Department, AppointmentSlot

# Get hospital and department
hospital = Hospital.objects.first()
department = hospital.departments.first()

# Create slots for tomorrow
tomorrow = timezone.now() + timedelta(days=1)
slot_date = tomorrow.date()

# Create a morning slot (10:00 AM)
start_time = timezone.make_aware(
    datetime.combine(slot_date, datetime.min.time().replace(hour=10, minute=0))
)
end_time = start_time + timedelta(minutes=30)

AppointmentSlot.objects.create(
    hospital=hospital,
    department=department,
    start_time=start_time,
    end_time=end_time,
    is_booked=False
)

print("✅ Slot created!")
```

### Method 3: Using Django Admin Panel

1. Go to `http://localhost:8000/admin/`
2. Login as superuser
3. Click on "Appointment slots"
4. Click "Add appointment slot"
5. Fill in:
   - Hospital
   - Department
   - Start time
   - End time
   - Is booked: ❌ (unchecked)
6. Save

### Verify Slots Were Created

```bash
python3 manage.py shell
```

```python
from queueing.models import AppointmentSlot
from django.utils import timezone

# Count available slots
available = AppointmentSlot.objects.filter(
    is_booked=False,
    start_time__gte=timezone.now()
).count()

print(f"Available slots: {available}")

# List next 10 slots
slots = AppointmentSlot.objects.filter(
    is_booked=False,
    start_time__gte=timezone.now()
).order_by('start_time')[:10]

for slot in slots:
    print(f"{slot.hospital.name} - {slot.department.name} - {slot.start_time}")
```

---

## Part 2: How Admins Can View Patient Details

### Viewing Patient Details from Appointments

When a patient books an appointment, admins can see **comprehensive patient information** through the admin dashboard.

### API Endpoint 1: List All Appointments with Patient Info

**GET** `/api/admin/appointments/`

```bash
curl -X GET http://localhost:8000/api/admin/appointments/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response includes patient details:**
```json
[
  {
    "id": 123,
    "patient_details": {
      "id": 45,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "patient",
      "date_joined": "2026-02-01T10:30:00Z",
      "total_appointments": 5,
      "completed_appointments": 3,
      "cancelled_appointments": 1
    },
    "hospital_name": "CareFlow General Hospital",
    "department_name": "Pediatrics",
    "symptoms": "Fever and cough",
    "status": "confirmed",
    "payment_status": "paid",
    "created_at": "2026-02-09T09:00:00Z"
  }
]
```

### API Endpoint 2: View Specific Appointment with Full Patient Info

**GET** `/api/admin/appointments/{appointment_id}/`

```bash
curl -X GET http://localhost:8000/api/admin/appointments/123/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response includes:**
- Full patient details (username, email, registration date)
- Patient statistics (total appointments, completed, cancelled)
- Complete appointment details
- Payment information
- Slot details

### API Endpoint 3: View All Patients (NEW)

**GET** `/api/admin/patients/`

```bash
curl -X GET http://localhost:8000/api/admin/patients/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
[
  {
    "id": 45,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "patient",
    "date_joined": "2026-02-01T10:30:00Z",
    "total_appointments": 5,
    "completed_appointments": 3
  },
  ...
]
```

### API Endpoint 4: View Detailed Patient Profile (NEW ✨)

**GET** `/api/admin/patients/{patient_id}/`

This endpoint shows **everything** about a patient!

```bash
curl -X GET http://localhost:8000/api/admin/patients/45/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response includes:**
```json
{
  "patient": {
    "id": 45,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "patient",
    "date_joined": "2026-02-01T10:30:00Z",
    "last_login": "2026-02-09T08:00:00Z"
  },
  "statistics": {
    "total_appointments": 5,
    "confirmed": 1,
    "in_progress": 1,
    "completed": 3,
    "cancelled": 0,
    "pending_payment": 0,
    "total_spent": 2000.00
  },
  "appointments": [
    {
      "id": 123,
      "hospital_name": "CareFlow General Hospital",
      "department_name": "Pediatrics",
      "symptoms": "Fever and cough",
      "status": "completed",
      "payment_status": "paid",
      "payment_amount": "500.00",
      "created_at": "2026-02-09T09:00:00Z",
      "completed_at": "2026-02-09T10:30:00Z"
    },
    // ... all appointments
  ]
}
```

---

## What Information Can Admins See?

### Basic Patient Info
- ✅ Patient ID
- ✅ Username
- ✅ Email address
- ✅ Role (patient)
- ✅ Registration date (date_joined)
- ✅ Last login time

### Patient Statistics
- ✅ Total number of appointments
- ✅ Completed appointments count
- ✅ Cancelled appointments count
- ✅ Appointments in progress
- ✅ Confirmed appointments
- ✅ Pending payment appointments
- ✅ Total amount spent

### Appointment Details
- ✅ Symptoms described by patient
- ✅ Additional notes
- ✅ Hospital and department
- ✅ Appointment slot time
- ✅ Status (pending, confirmed, in progress, completed, cancelled)
- ✅ Payment status and amount
- ✅ Creation and completion timestamps

### Payment Information
- ✅ Transaction ID
- ✅ Payment amount
- ✅ Payment gateway used
- ✅ Payment method (card, UPI, etc.)
- ✅ Payment timestamp

---

## Admin Dashboard Workflow

### Scenario 1: Patient Books Online, Admin Views Details

1. **Patient books appointment** via the web app
2. **Admin opens dashboard** and navigates to "Appointments"
3. **Admin sees list** of all appointments with patient names
4. **Admin clicks on appointment** to view full details
5. **System shows:**
   - Patient's full profile
   - Contact information
   - Medical history (past appointments)
   - Current symptoms
   - Payment status

### Scenario 2: Admin Needs Patient History

1. **Admin opens "Patients" section** in dashboard
2. **Searches for patient** by name
3. **Clicks on patient** to view profile
4. **System shows:**
   - Complete appointment history
   - Total visits and spending
   - Success rate (completed vs cancelled)
   - Last visit date

---

## Testing the Complete Flow

### Step 1: Create Some Appointment Slots
```bash
python3 manage.py create_appointment_slots --days 7 --slots-per-day 10
```

### Step 2: Patient Books Appointment (via Frontend)
- Open the web app
- Login as patient
- Select hospital and department
- Choose available slot
- Enter symptoms and make payment
- ✅ Appointment confirmed

### Step 3: Admin Views Patient Details

**Option A: Through Appointments List**
```bash
curl -X GET http://localhost:8000/api/admin/appointments/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Option B: Through Specific Appointment**
```bash
curl -X GET http://localhost:8000/api/admin/appointments/123/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Option C: Through Patient Profile**
```bash
# First, get the patient ID from appointments list
# Then:
curl -X GET http://localhost:8000/api/admin/patients/45/ \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Summary of Admin Capabilities

| What Admin Wants | API Endpoint | Information Shown |
|------------------|--------------|-------------------|
| See all appointments | `GET /api/admin/appointments/` | List with basic patient info |
| View specific appointment | `GET /api/admin/appointments/{id}/` | Full patient & payment details |
| See all patients | `GET /api/admin/patients/` | List with stats |
| View patient profile | `GET /api/admin/patients/{id}/` | Complete history & statistics |
| Register walk-in patient | `POST /api/admin/patients/register/` | Creates account immediately |

---

## Next Steps for Frontend

### For Patient Booking Flow:
1. ✅ Display available slots from API
2. ✅ Allow patient to select slot
3. ✅ Collect symptoms and notes
4. ✅ Process payment
5. ✅ Show confirmation

### For Admin Dashboard:
1. ✅ Show list of all appointments
2. ✅ Click appointment to see patient details
3. ✅ Show patient profile page with:
   - Contact information
   - Appointment history
   - Statistics (visits, spending)
4. ✅ Add "Register Walk-in Patient" button
5. ✅ Show patient search/filter

---

## Quick Reference Commands

```bash
# Create appointment slots
python3 manage.py create_appointment_slots

# Check how many slots exist
python3 manage.py shell -c "from queueing.models import AppointmentSlot; print(AppointmentSlot.objects.filter(is_booked=False).count())"

# Run the server
python3 manage.py runserver

# Get admin token (replace with your admin credentials)
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'

# View all appointments as admin
curl -X GET http://localhost:8000/api/admin/appointments/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# View patient details
curl -X GET http://localhost:8000/api/admin/patients/1/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Security Notes

- ✅ All admin endpoints require authentication (JWT token)
- ✅ Only users with `role='admin'` can access patient details
- ✅ Patient data is protected from unauthorized access
- ✅ Email addresses are only visible to admins, not other patients
