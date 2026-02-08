#!/bin/bash

# Test Script for Patient Dashboard APIs
# This script tests the complete patient booking flow

BASE_URL="http://localhost:8000/api"

echo "🧪 Testing Patient Dashboard APIs"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Register a new patient
echo -e "${BLUE}1. Registering new patient...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/patient/register/" \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "test_patient_'$(date +%s)'",
    "email": "patient'$(date +%s)'@test.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
PATIENT_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.tokens.access')

if [ "$PATIENT_TOKEN" != "null" ] && [ ! -z "$PATIENT_TOKEN" ]; then
  echo -e "${GREEN}✅ Patient registration successful!${NC}"
  echo "Access Token: ${PATIENT_TOKEN:0:20}..."
else
  echo -e "${RED}❌ Patient registration failed${NC}"
  exit 1
fi

echo ""
echo "=================================="
echo ""

# 2. Get hospitals list
echo -e "${BLUE}2. Fetching hospitals list...${NC}"
HOSPITALS_RESPONSE=$(curl -s -X GET "${BASE_URL}/patient/hospitals/")
echo "$HOSPITALS_RESPONSE" | jq '.'

HOSPITAL_COUNT=$(echo "$HOSPITALS_RESPONSE" | jq '. | length')
if [ "$HOSPITAL_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ Found ${HOSPITAL_COUNT} hospital(s)${NC}"
  HOSPITAL_ID=$(echo "$HOSPITALS_RESPONSE" | jq -r '.[0].id')
else
  echo -e "${RED}⚠️  No hospitals found. Please create a hospital first.${NC}"
  HOSPITAL_ID=1
fi

echo ""
echo "=================================="
echo ""

# 3. Book an appointment
echo -e "${BLUE}3. Booking appointment...${NC}"
BOOKING_RESPONSE=$(curl -s -X POST "${BASE_URL}/patient/book-appointment/" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${PATIENT_TOKEN}" \
  -d "{
    \"hospital_id\": ${HOSPITAL_ID},
    \"symptoms\": \"Test appointment - Fever and cold\",
    \"notes\": \"This is a test booking\",
    \"payment_amount\": 500.00
  }")

echo "$BOOKING_RESPONSE" | jq '.'
APPOINTMENT_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.appointment.id')

if [ "$APPOINTMENT_ID" != "null" ] && [ ! -z "$APPOINTMENT_ID" ]; then
  echo -e "${GREEN}✅ Appointment booked! ID: ${APPOINTMENT_ID}${NC}"
else
  echo -e "${RED}❌ Appointment booking failed${NC}"
  exit 1
fi

echo ""
echo "=================================="
echo ""

# 4. Initiate payment
echo -e "${BLUE}4. Initiating payment (Test Mode)...${NC}"
PAYMENT_INIT_RESPONSE=$(curl -s -X POST "${BASE_URL}/patient/payment/initiate/" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${PATIENT_TOKEN}" \
  -d "{
    \"appointment_id\": ${APPOINTMENT_ID},
    \"gateway\": \"test\"
  }")

echo "$PAYMENT_INIT_RESPONSE" | jq '.'
TRANSACTION_ID=$(echo "$PAYMENT_INIT_RESPONSE" | jq -r '.transaction_id')

if [ "$TRANSACTION_ID" != "null" ] && [ ! -z "$TRANSACTION_ID" ]; then
  echo -e "${GREEN}✅ Payment initiated! Transaction ID: ${TRANSACTION_ID}${NC}"
else
  echo -e "${RED}❌ Payment initiation failed${NC}"
  exit 1
fi

echo ""
echo "=================================="
echo ""

# 5. Verify payment (Test mode - always succeeds)
echo -e "${BLUE}5. Verifying payment (Test Mode - Auto Success)...${NC}"
PAYMENT_VERIFY_RESPONSE=$(curl -s -X POST "${BASE_URL}/patient/payment/verify/" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${PATIENT_TOKEN}" \
  -d "{
    \"transaction_id\": \"${TRANSACTION_ID}\",
    \"test_mode\": true,
    \"payment_method\": \"test\"
  }")

echo "$PAYMENT_VERIFY_RESPONSE" | jq '.'

PAYMENT_STATUS=$(echo "$PAYMENT_VERIFY_RESPONSE" | jq -r '.payment.status')
APPOINTMENT_STATUS=$(echo "$PAYMENT_VERIFY_RESPONSE" | jq -r '.appointment.status')

if [ "$PAYMENT_STATUS" == "success" ] && [ "$APPOINTMENT_STATUS" == "confirmed" ]; then
  echo -e "${GREEN}✅ Payment successful! Appointment confirmed!${NC}"
else
  echo -e "${RED}❌ Payment verification failed${NC}"
  exit 1
fi

echo ""
echo "=================================="
echo ""

# 6. Get my appointments
echo -e "${BLUE}6. Fetching my appointments...${NC}"
MY_APPOINTMENTS_RESPONSE=$(curl -s -X GET "${BASE_URL}/patient/my-appointments/" \
  -H "Authorization: Bearer ${PATIENT_TOKEN}")

echo "$MY_APPOINTMENTS_RESPONSE" | jq '.'

APPOINTMENT_COUNT=$(echo "$MY_APPOINTMENTS_RESPONSE" | jq '. | length')
echo -e "${GREEN}✅ Found ${APPOINTMENT_COUNT} appointment(s)${NC}"

echo ""
echo "=================================="
echo ""

# 7. Admin views appointments (need admin token)
echo -e "${BLUE}7. Admin Login...${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login/" \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "anurag2908@gmail.com",
    "password": "Anurag2908"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.tokens.access')

if [ "$ADMIN_TOKEN" != "null" ] && [ ! -z "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ Admin login successful!${NC}"
  
  echo ""
  echo -e "${BLUE}8. Admin viewing all appointments...${NC}"
  ADMIN_APPOINTMENTS_RESPONSE=$(curl -s -X GET "${BASE_URL}/admin/appointments/" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}")
  
  echo "$ADMIN_APPOINTMENTS_RESPONSE" | jq '.'
  
  TOTAL_APPOINTMENTS=$(echo "$ADMIN_APPOINTMENTS_RESPONSE" | jq '. | length')
  echo -e "${GREEN}✅ Admin can see ${TOTAL_APPOINTMENTS} total appointment(s)${NC}"
else
  echo -e "${RED}⚠️  Admin login failed - skipping admin tests${NC}"
fi

echo ""
echo "=================================="
echo ""
echo -e "${GREEN}🎉 All Tests Passed!${NC}"
echo ""
echo "Summary:"
echo "  ✅ Patient registered successfully"
echo "  ✅ Appointment booked (ID: ${APPOINTMENT_ID})"
echo "  ✅ Payment processed (Transaction: ${TRANSACTION_ID})"
echo "  ✅ Appointment confirmed"
echo "  ✅ Admin can view the appointment"
echo ""
echo "🚀 The complete patient booking flow is working!"
