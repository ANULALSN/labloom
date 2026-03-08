# 📱 Labloom Patient Mobile API (Flutter Integration Guide)

This document provides a consolidated, up-to-date list of backend endpoints for the Flutter mobile application development team. 

All core patient routes below are prefixed with `/api/patients` unless specified otherwise.

---

## 🔐 1. Authentication & Onboarding
**Base Path:** `/api/auth/v2` and `/api/patients`  
**Headers:** `Content-Type: application/json`. Protected routes require `Authorization: Bearer <access_token>`.

| Feature | Method | Endpoint | Payload / Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Request OTP** | `POST` | `/api/auth/v2/request-otp` | `{ "phone": "+91..." }` | Public |
| **Verify OTP** | `POST` | `/api/auth/v2/verify-otp` | `{ "phone": "+91...", "otp": "..." }` | Public |
| **Signup** | `POST` | `/api/auth/v2/signup` | `{ "name", "phone", "role": "patient" }` | Public |
| **Refresh Token**| `POST` | `/api/auth/v2/refresh-token` | `{ "refreshToken": "..." }` | Public |
| **Complete Onboarding**| `PATCH`| `/api/patients/health-profile` | Updates unified health profile (Steps 1-4) | Required |

---

## 👤 2. Profile & Dashboard
**Base Path:** `/api/patients`

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `GET` | `/dashboard` | Patient stats, upcoming appointments, recent reports | Required |
| **My Profile** | `GET` | `/me` | Fetch logged-in patient's personal and health details | Required |
| **Update Basic Info**| `PATCH`| `/me` | Update general information | Required |
| **Upload Avatar** | `POST` | `/upload-profile-image`| `multipart/form-data` with `image` field | Required |

---

## 🩺 3. Entity Discovery (Doctors, Labs, Hospitals)
**Base Path:** `/api/patients`

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Search Doctors**| `GET` | `/doctors` | Filter doctors (`?specialty=` or `?search=`) | Public |
| **Search Labs** | `GET` | `/labs` | Find labs (`?city=` or `?search=`) | Public |
| **Lab Tests** | `GET` | `/labs/:id/tests` | List available tests in a specific lab | Public |
| **Hospitals** | `GET` | `/hospitals` | Find hospitals (`?city=` or `?search=`) | Public |
| **Top Hospitals** | `GET` | `/hospitals/popular` | List highly-rated hospitals | Public |
| **Hospital Details**| `GET` | `/hospitals/:id` | Full details of a specific hospital | Public |

### 🔗 Profile Sharing (Deep Linking / \`share_plus\`)
For the Flutter `share_plus` feature, the following endpoint provides comprehensive bio, consultation fees, experience, and reviews for a shared entity link.

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Doctor Details**| `GET` | `/api/doctors/:id/details` | Used to render full shared doctor profile | Public |

---

## 📅 4. Bookings & Appointments
**Base Path:** `/api/patients`

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Doctor Slots** | `GET` | `/doctors/:id/slots` | Available slots (`?date=YYYY-MM-DD`) | Public |
| **Book Doctor** | `POST` | `/appointments` | Payload: `{ "doctorId", "date", "time", "appointmentMode", "amount" }` | Required |
| **My Appointments**| `GET` | `/appointments/me` | List consultation history & upcoming visits | Required |
| **Book Lab Test** | `POST` | `/bookings` | Book a diagnostic test at a laboratory | Required |
| **My Lab Tests** | `GET` | `/bookings/me` | History and status of lab tests | Required |

---

## 📄 5. Medical Records, AI & PDFs
**Base Path:** `/api/patients`

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Lab Reports** | `GET` | `/reports` | Access finalized laboratory reports | Required |
| **Prescriptions** | `GET` | `/prescriptions` | View digital prescriptions from doctors | Required |
| **AI Summarize** | `POST` | `/analyze-report` | `multipart/form-data` with `file`. AI text analysis | Required |

> **💡 Handling PDFs in Flutter**: The backend delivers Cloudinary URL links for reports. To prevent binary fetch crashes on mobile, do not try to parse them as JSON. Instead, pass the URL directly to packages like `url_launcher` (to open the browser) or `flutter_pdfview` (to embed the PDF inside the app).

---

## 📈 6. Health Metrics
**Base Path:** `/api/patients/health-metrics`

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Vitals History**| `GET` | `/` | Query `?type=all` to see historical data | Required |
| **Log Vital** | `POST` | `/` | Log metric manually | Required |

---

## ⭐ 7. Reviews & Feedback
**Base Path:** `/api/patients`

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Submit Review** | `POST` | `/feedback` | `{ "targetId", "targetType", "rating", "comment" }` | Required |
| **Get Reviews** | `GET` | `/reviews` | `?targetId=...&targetType=doctor\|lab\|hospital` | Public |
| **My Reviews** | `GET` | `/feedback/my` | History of all reviews the patient has posted | Required |

---

## 💬 8. Communication (Chat)

| Feature | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Chat History** | `GET` | `/api/chat/:bookingId` | Fetch messages for an appointment | Required |
| **Send Message** | `POST` | `/api/chat/send` | Send text to the doctor | Required |

---

### 🌐 Environment Details
* **Base URL:** `https://labloom.onrender.com` 
* **Swagger API Docs:** `https://labloom.onrender.com/docs/swagger` (Includes detailed request/response schemas)
