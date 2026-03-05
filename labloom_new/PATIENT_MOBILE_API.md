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
    "email": "your.email@example.com",
    "city": "Mumbai",
    "address": "123 Green Street"
  },
  "emergencyContact": {
    "firstName": "Jane",
    "lastName": "Doe",
    "relationship": "Spouse",
    "phone": "+919988776655",
    "email": "email@example.com",
    "city": "Mumbai",
    "address": "456 Red Street"
  },
  "healthProfile": {
    "bloodType": "O",
    "rhFactor": "+",
    "allergies": "Peanuts, Pollen",
    "chronicConditions": "Migraines, Diabetes",
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

### Lab Report Flow (End-to-End)
The lab report lifecycle follows this pipeline:

```
Patient books test → Lab completes test → Lab uploads report image
                                              ↓
                              Patient's last doctor auto-assigned
                                              ↓
                              Doctor verifies → Patient gets email
                                              ↓
                              Patient views verified report in app
```

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Lab Reports** | `GET` | `/api/patients/reports` | **Only returns doctor-verified reports** |
| **My Appointments**| `GET`| `/api/patients/appointments/me` | Includes `labReport` object with `reportUrl`, `verifiedByDoctor`, `status` |
| **Prescriptions**| `GET` | `/api/patients/prescriptions`| Digital prescriptions from visits |

### Lab Report Object (in booking response)
```json
{
  "labReport": {
    "reportUrl": "https://res.cloudinary.com/.../report.jpg",
    "status": "Verified by Doctor",
    "resultDate": "2026-03-05T10:00:00.000Z",
    "verifiedByDoctor": true,
    "verifiedBy": "doctor_user_id",
    "referringDoctor": "doctor_user_id"
  }
}
```

**Report visibility rules for Flutter:**
- Show `📄 View Report` button only when `labReport.verifiedByDoctor === true`
- Show `⏳ Under Review` badge when `labReport.reportUrl` exists but `verifiedByDoctor === false`
- Show nothing when `labReport` is null

## 💬 Communication
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Chat History** | `GET` | `/api/chat/:bookingId` | Fetch messages for an appointment |
| **Send Message** | `POST` | `/api/chat/send` | Send text to the doctor |

## ⭐ Reviews & Feedback
| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Submit Review** | `POST` | `/api/patients/feedback` | Rate a doctor, lab, or hospital |
| **Get Reviews** | `GET` | `/api/patients/reviews` | Query `?targetId=...&targetType=doctor` |

### 📝 Review Payload
```json
{
  "targetId": "65ab123...",
  "targetType": "doctor",
  "targetName": "Dr. Smith",
  "rating": 5,
  "comment": "Excellent service and care."
}
```

## 📄 File Uploads (Cloudinary Integration)
*All uploads are **image-only** (JPG, PNG, WebP). PDFs are NOT supported.*

| Feature | Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **Verify Doctor Docs** | `POST` | `/api/upload/doctor-document` | Upload doctor licensure/certificates | `FormData (document)` |
| **Verify Lab Docs** | `POST` | `/api/upload/lab-document/:labId` | Upload lab ID/registration proofs | `FormData (document)` |
| **Patient Report/Mail**| `POST` | `/api/upload/patient-report/:bookingId`| Upload & mail report to patient directly | `FormData (report)` |

### 📧 Email Notifications
The system sends emails to patients at these stages:
1. **Report uploaded** — "Your report is under review by a doctor"
2. **Report verified** — "Your report is ready! View it here: [link]"
3. **Report emailed** — Lab can manually resend via `POST /api/lab/bookings/:id/send-email`

---
**Base URL:** `https://labloom.onrender.com`  
**Swagger Docs:** `https://labloom.onrender.com/docs/swagger` (Fully detailed schema)

> **⚠️ Important:** The patient portal is mobile-only (Flutter). The web app (`labloom-web`) only serves Admin, Doctor, Hospital, and Lab portals. Patient APIs remain fully functional for the Flutter app.
