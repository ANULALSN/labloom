# Labloom API Quick Reference

**Base URL:** `https://labloom-malabar.vercel.app`

---

## 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/request-otp` | ❌ | Request OTP for login |
| POST | `/api/auth/verify-otp` | ❌ | Verify OTP and login |
| POST | `/api/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/api/auth/logout` | ✅ | Logout user |

---

## 👤 Patient Portal (`/api/patients`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | ✅ | Get patient dashboard |
| GET | `/me` | ✅ | Get patient profile |
| PATCH | `/me` | ✅ | Update patient profile |
| PATCH | `/health-profile` | ✅ | Unified Onboarding (4 Steps) |
| GET | `/health-metrics?type={type}` | ✅ | Get health metrics history |
| POST | `/health-metrics` | ✅ | Add new health metric |
| GET | `/appointments/me` | ✅ | Get my appointments |
| POST | `/appointments` | ✅ | Book new appointment |
| GET | `/bookings/me` | ✅ | Get my lab bookings |
| POST | `/bookings` | ✅ | Book lab test |
| GET | `/doctors?query={q}` | ❌ | Search doctors |
| GET | `/labs?city={city}` | ❌ | Find labs |
| GET | `/reports` | ✅ | Get lab reports |
| GET | `/prescriptions` | ✅ | Get prescriptions |
| POST | `/feedback` | ✅ | Submit feedback/review |
| GET | `/reviews?targetId={id}&targetType={type}` | ❌ | Get reviews for entity |

---

## 👨‍⚕️ Doctor Portal (`/api/doctor`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/appointments?status={s}&date={d}` | ✅ | Get doctor's appointments |
| GET | `/appointments/{id}` | ✅ | Get appointment details |
| PATCH | `/appointments/{id}/status` | ✅ | Update appointment status |
| GET | `/patients?search={q}` | ✅ | Get doctor's patients |
| GET | `/patients/{id}/history` | ✅ | Get patient history |
| POST | `/consultations/{id}/records` | ✅ | Save consultation notes |
| POST | `/consultations/{id}/prescribe` | ✅ | Issue prescription |

---

## 🔬 Lab Portal (`/api/lab`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/bookings?status={status}` | ✅ | Get lab bookings |
| POST | `/bookings` | ✅ | Add offline booking |
| PATCH | `/bookings/{id}/status` | ✅ | Update sample status |
| POST | `/reports/upload` | ✅ | Upload lab report |
| POST | `/reports/{id}/validate` | ✅ | Validate report |
| GET | `/staff` | ✅ | Get lab staff |
| POST | `/staff` | ✅ | Add staff member |
| PATCH | `/settings` | ✅ | Update lab settings |

---

## 🏥 Hospital Portal (`/api/hospital`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/patients?status={status}` | ✅ | Get hospital patients |
| POST | `/patients/admit` | ✅ | Admit patient |
| POST | `/patients/{id}/discharge` | ✅ | Discharge patient |
| GET | `/beds` | ✅ | Get bed availability |
| PATCH | `/beds/{id}` | ✅ | Update bed status |

---

## 🛡️ Admin Portal (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/pending-hospitals` | ✅ | Get pending hospitals |
| POST | `/approve-hospital/{id}` | ✅ | Approve hospital |
| GET | `/pending-labs` | ✅ | Get pending labs |
| POST | `/approve-lab/{id}` | ✅ | Approve lab |
| GET | `/users?search={q}` | ✅ | Get all users |
| PATCH | `/users/{id}/status` | ✅ | Update user status |
| GET | `/reports/system` | ✅ | Get system analytics |

---

## 🛠️ Utilities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/utils/cities?query={q}` | ❌ | Search cities |
| GET | `/api/tests` | ❌ | Get all lab tests |
| GET | `/api/notifications` | ✅ | Get notifications |
| GET | `/api/payments/methods` | ✅ | Get payment methods |

---

## 📋 Common Request Bodies

### Signup
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "role": "patient",
  "privacyPolicyAccepted": true
}
```

### Complete Onboarding (PATCH /api/patients/health-profile)
```json
{
  "personalData": {
    "firstName": "John",
    "lastName": "Doe",
    "dob": "1990-01-01",
    "phone": "+919876543210",
    "city": "Mumbai",
    "address": "123 Green Street"
  },
  "emergencyContact": {
    "firstName": "Jane",
    "lastName": "Doe",
    "relationship": "Spouse",
    "phone": "+919988776655"
  },
  "healthProfile": {
    "bloodType": "O",
    "rhFactor": "+",
    "allergies": "Peanuts",
    "height": 175,
    "weight": 70,
    "bloodPressure": { "systolic": 120, "diastolic": 80 }
  },
  "lifestyle": {
    "smoking": "No",
    "alcohol": "Occasionally",
    "activityLevel": "Moderate"
  }
}
```

### Book Appointment
```json
{
  "doctorId": "65ab123...",
  "date": "2024-10-25",
  "time": "10:30 AM",
  "appointmentMode": "Video call",
  "reason": "Regular checkup"
}
```

### Add Health Metric
```json
{
  "type": "Blood Pressure",
  "value": "120/80",
  "unit": "mmHg",
  "notes": "Morning reading"
}
```

### Issue Prescription
```json
{
  "prescriptions": [
    {
      "medication": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "7 days",
      "instructions": "Take after meals"
    }
  ]
}
```

### Submit Review
```json
{
  "targetId": "65ab123...",
  "targetType": "doctor",
  "targetName": "Dr. Smith",
  "rating": 5,
  "comment": "Very professional and helpful."
}
```

---

## 🔑 Headers

### All Authenticated Requests
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### File Upload
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

---

## ⚠️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## 💾 Local Storage Keys

```javascript
localStorage.setItem('accessToken', '...');
localStorage.setItem('refreshToken', '...');
localStorage.setItem('user', JSON.stringify({...}));
```

---

## 🔄 Token Refresh Flow

1. Request fails with **401**
2. Call `/api/auth/refresh-token` with `refreshToken`
3. Store new `accessToken`
4. Retry original request
5. If refresh fails → Redirect to login

---

*For detailed documentation, see FRONTEND_INTEGRATION_GUIDE.md*
