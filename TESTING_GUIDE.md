# Testing the Admin Offline Patient Registration Feature

## Prerequisites

Before testing, ensure your Django environment is properly set up with all dependencies installed.

If you haven't already, install dependencies:
```bash
cd backend
pip install -r requirements.txt
# or
pip3 install -r requirements.txt
```

## Quick Test Steps

### Step 1: Start the Backend Server

```bash
cd backend
python manage.py runserver
# or
python3 manage.py runserver
```

### Step 2: Get Admin Authentication Token

First, login as an admin to get the JWT token:

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_admin_username",
    "password": "your_admin_password"
  }'
```

Save the `access` token from the response.

### Step 3: Test the New Endpoint

#### Test 1: Register patient only

```bash
curl -X POST http://localhost:8000/api/admin/patients/register/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient_1",
    "email": "test1@example.com"
  }'
```

**Expected Response:**
- Status: 201 Created
- Should return patient details with auto-generated temporary password

#### Test 2: Register patient with appointment

```bash
curl -X POST http://localhost:8000/api/admin/patients/register/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient_2",
    "email": "test2@example.com",
    "hospital_id": 1,
    "department_id": 1,
    "symptoms": "Test symptoms",
    "notes": "Walk-in patient test"
  }'
```

**Expected Response:**
- Status: 201 Created
- Should return both patient details AND appointment details
- Appointment status should be "confirmed"
- Payment status should be "paid"

#### Test 3: Duplicate username error

```bash
curl -X POST http://localhost:8000/api/admin/patients/register/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient_1",
    "email": "another@example.com"
  }'
```

**Expected Response:**
- Status: 400 Bad Request
- Error: "Username already exists. Please use a different username."

#### Test 4: Without admin authentication

```bash
curl -X POST http://localhost:8000/api/admin/patients/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient_3"
  }'
```

**Expected Response:**
- Status: 401 Unauthorized
- Should deny access without authentication

### Step 4: Verify Patient Can Login

Use the temporary password returned in Test 1 or Test 2:

```bash
curl -X POST http://localhost:8000/api/patient/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient_1",
    "password": "TEMPORARY_PASSWORD_FROM_RESPONSE"
  }'
```

**Expected Response:**
- Status: 200 OK
- Should return patient JWT tokens

## Using HTTP Client (VSCode REST Client)

If you have the REST Client extension for VSCode, you can use the examples in:
`backend/api_examples/admin_register_patient.http`

1. Open the file in VSCode
2. Replace `YOUR_ADMIN_TOKEN_HERE` with your actual admin JWT token
3. Click "Send Request" above each example

## Postman Collection

You can also import these requests into Postman:

1. Create a new collection "Admin Patient Registration"
2. Add a POST request to `http://localhost:8000/api/admin/patients/register/`
3. Set Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_TOKEN`
4. Add various request bodies from the examples

## What to Verify

✅ Patient account is created successfully
✅ Temporary password is auto-generated when not provided
✅ Patient can login with temporary password
✅ Appointment is created when hospital_id is provided
✅ Appointment status is "confirmed" (not "pending_payment")
✅ Payment status is "paid"
✅ Duplicate username returns error
✅ Only admin users can access the endpoint
✅ Email is optional
✅ Password is optional

## Database Verification

You can verify the data in the database:

```bash
python manage.py shell
```

Then in the Django shell:

```python
from queueing.models import User, Appointment

# Check if patient was created
patient = User.objects.filter(username='test_patient_1').first()
print(f"Patient: {patient.username}, Email: {patient.email}, Role: {patient.role}")

# Check if appointment was created
if appointment := Appointment.objects.filter(patient=patient).first():
    print(f"Appointment: Status={appointment.status}, Payment={appointment.payment_status}")
```

## Troubleshooting

### Issue: "command not found: python"
**Solution:** Use `python3` instead of `python`

### Issue: "No module named 'rest_framework_simplejwt'"
**Solution:** Install dependencies:
```bash
pip install djangorestframework-simplejwt
```

### Issue: "Authentication credentials were not provided"
**Solution:** Make sure you include the Authorization header with a valid JWT token

### Issue: "Token is invalid or expired"
**Solution:** Login again to get a fresh token

### Issue: "You do not have permission to perform this action"
**Solution:** Make sure you're logged in as an admin user (role='admin'), not a patient

## Next Steps

After successful testing:
1. ✅ Integrate with frontend admin dashboard
2. ✅ Add UI form for patient registration
3. ✅ Display temporary password in a modal
4. ✅ Add print functionality for patient credentials
5. ✅ Implement patient search to avoid duplicates

## Documentation

For complete API documentation, see:
- `ADMIN_PATIENT_REGISTRATION.md` - Full API documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details and summary
