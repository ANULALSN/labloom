# 📱 Labloom Patient Mobile API (Flutter Integration Guide)

This document provides a consolidated list of endpoints for the Flutter mobile application development team.

## 🔐 Authentication (Auth V2)
All requests should use JSON headers. Protected routes require `Authorization: Bearer <access_token>`.

| Feature | Method | Endpoint | Payload |
| :--- | :--- | :--- | :--- |
| **Request OTP** | `POST` | `/api/auth/v2/request-otp` | `{ "phone": "+91..." }` |
| **Verify OTP** | `POST` | `/api/auth/v2/verify-otp` | `{ "phone": "+91...", "otp": "..." }` |
| **Signup** | `POST` | `/api/auth/v2/signup` | `{ "name", "phone", "role": "patient" }` |
| **Refresh Token**| `POST` | `/api/auth/v2/refresh-token` | `{ "refreshToken": "..." }` |

## 🏠 Dashboard & Profile
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Complete Onboarding**| `PATCH`| `/api/patients/health-profile` | **Unified Onboarding (Step 1-4)** |
| **Dashboard** | `GET` | `/api/patients/dashboard` | Counts of visits, reports, prescriptions |
| **My Profile** | `GET` | `/api/patients/me` | Fetch personal and health profiling |
| **Update Basic Info**| `PATCH`| `/api/patients/me` | Update health stats, address, etc. |
| **Vitals History**| `GET` | `/api/patients/health-metrics` | Query `?type=bp` or `?type=all` |
| **Log Vital** | `POST` | `/api/patients/health-metrics` | Log weight, BP, Heart rate, etc. |

### 📋 Onboarding Payload Structure
Used for the 4-step initial registration flow:
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
*Note: Successful completion sets `isHealthProfileComplete: true` on the user object.*

## 🩺 Doctor & Hospital Discovery
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Search Doctors**| `GET` | `/api/patients/doctors` | Use query params for filtering |
| **Doctor Slots** | `GET` | `/api/patients/doctors/:id/slots`| Query `?date=YYYY-MM-DD` |
| **Hospitals** | `GET` | `/api/patients/hospitals/popular` | List top hospitals |

## 🧪 Laboratory & Tests
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Search Labs** | `GET` | `/api/patients/labs` | Find labs nearby |
| **Lab Tests** | `GET` | `/api/patients/labs/:id/tests` | List available tests in a lab |
| **Book Test** | `POST` | `/api/patients/bookings` | Book a lab diagnostic test |

## 📄 Records & Reports
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Lab Reports** | `GET` | `/api/patients/reports` | **Only returns doctor-verified reports** |
| **Prescriptions**| `GET` | `/api/patients/prescriptions`| Digital prescriptions from visits |

## 💬 Communication
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Chat History** | `GET` | `/api/chat/:bookingId` | Fetch messages for an appointment |
| **Send Message** | `POST` | `/api/chat/send` | Send text to the doctor |

---
**Base URL:** `https://labloom.onrender.com`  
**Swagger Docs:** `https://labloom.onrender.com/docs/swagger` (Fully detailed schema)
