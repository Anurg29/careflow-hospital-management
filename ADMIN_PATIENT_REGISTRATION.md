# Admin Patient Registration - Offline Walk-in Patients

## Overview
Hospital admins can now register patients who come to the hospital in person (offline) directly from their dashboard. This feature allows admins to:
- Create patient accounts for walk-in patients
- Optionally book appointments on behalf of the patient
- Handle offline payment scenarios

## API Endpoint

**POST** `/api/admin/patients/register/`

### Authentication
Requires admin authentication (JWT token with admin role)

### Request Body

#### Minimum Required Fields
```json
{
  "username": "patient_name"
}
```

#### Full Registration with Appointment
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "optional_password",
  "hospital_id": 1,
  "department_id": 2,
  "symptoms": "Fever, headache",
  "notes": "Walk-in patient"
}
```

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | ✅ Yes | Unique username for the patient |
| `email` | string | ❌ No | Patient's email address |
| `password` | string | ❌ No | Patient password (auto-generated if not provided) |
| `hospital_id` | integer | ❌ No | Hospital ID to book appointment (if provided, appointment is created) |
| `department_id` | integer | ❌ No | Department ID for the appointment |
| `symptoms` | string | ❌ No | Patient's symptoms |
| `notes` | string | ❌ No | Additional notes about the patient/visit |

### Response

#### Success Response (201 Created)
```json
{
  "message": "Patient registered successfully",
  "patient": {
    "id": 123,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "patient",
    "temporary_password": "temp_a1b2c3d4"  // Only if password was auto-generated
  },
  "appointment": {
    "id": 456,
    "patient": 123,
    "patient_name": "john_doe",
    "hospital": 1,
    "hospital_name": "City Hospital",
    "department": 2,
    "department_name": "General Medicine",
    "status": "confirmed",
    "payment_status": "paid",
    "payment_amount": "0.00",
    "symptoms": "Fever, headache",
    "notes": "Walk-in patient",
    "created_at": "2026-02-09T14:30:00Z",
    "confirmed_at": "2026-02-09T14:30:00Z"
  }
}
```

#### Error Responses

**400 Bad Request** - Missing username
```json
{
  "error": "username is required"
}
```

**400 Bad Request** - Username already exists
```json
{
  "error": "Username already exists. Please use a different username."
}
```

**400 Bad Request** - Email already registered
```json
{
  "error": "Email already registered."
}
```

**403 Forbidden** - Not an admin user
```json
{
  "detail": "You do not have permission to perform this action."
}
```

## Usage Examples

### Example 1: Simple Patient Registration (No Appointment)
Just create a patient account for future use:

```bash
curl -X POST http://localhost:8000/api/admin/patients/register/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_smith",
    "email": "jane@example.com"
  }'
```

### Example 2: Register Patient + Create Appointment
Register a walk-in patient and immediately create a confirmed appointment:

```bash
curl -X POST http://localhost:8000/api/admin/patients/register/ \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "jane_smith",
    "email": "jane@example.com",
    "hospital_id": 1,
    "department_id": 3,
    "symptoms": "Back pain, difficulty walking",
    "notes": "Walk-in patient - paid cash at reception"
  }'
```

## Features

### 1. Auto-Generated Passwords
If no password is provided, the system automatically generates a temporary password (format: `temp_XXXXXXXX`). This password is returned in the response so the admin can provide it to the patient.

### 2. Direct Confirmation
Appointments created through admin registration are:
- Automatically set to `confirmed` status (skip pending payment)
- Marked as `paid` (assuming offline payment at reception)
- Given a `payment_amount` of `0.00` (to be updated if needed)

### 3. Flexible Registration
- Can register patient only (no appointment)
- Can register patient AND create appointment in one step
- Email is optional (useful for patients without email)

## Workflow

1. **Patient arrives at hospital** (offline/walk-in)
2. **Admin opens dashboard** and navigates to "Register Patient" section
3. **Admin enters patient details**:
   - Name/username (required)
   - Email (optional)
   - Can provide custom password or let system auto-generate
4. **Admin optionally books appointment**:
   - Select hospital and department
   - Enter symptoms and notes
5. **System creates patient account** and confirms appointment immediately
6. **Admin provides credentials** to patient (if password was auto-generated)
7. **Patient can now use the system** for future online bookings

## Security Notes

- Only users with `admin` role can access this endpoint
- Usernames must be unique
- Email validation is performed if provided
- Passwords are hashed using Django's password hashing system
- Auto-generated passwords are cryptographically secure random strings

## Database Impact

### Creates:
- New `User` record with `role='patient'`
- Optional `Appointment` record (if hospital_id provided)

### Updates:
- None (only creates new records)

## Frontend Integration Tips

1. **Registration Form Fields**:
   - Username (text input, required)
   - Email (email input, optional)
   - Password (password input, optional with "auto-generate" checkbox)
   - Hospital (dropdown, optional)
   - Department (dropdown, optional, shown only if hospital selected)
   - Symptoms (textarea, optional)
   - Notes (textarea, optional)

2. **Success Handling**:
   - Display temporary password to admin if auto-generated
   - Show appointment confirmation if created
   - Provide option to print patient credentials

3. **Error Handling**:
   - Check for duplicate username and suggest alternatives
   - Validate email format before submission
   - Handle network errors gracefully
