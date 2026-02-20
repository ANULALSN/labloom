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
| **Dashboard** | `GET` | `/api/patients/dashboard` | Counts of visits, reports, prescriptions |
| **My Profile** | `GET` | `/api/patients/me` | Fetch personal and health profiling |
| **Update Profile**| `PATCH`| `/api/patients/me` | Update health stats, address, etc. |
| **Vitals History**| `GET` | `/api/patients/health-metrics` | Query `?type=bp` or `?type=all` |
| **Log Vital** | `POST` | `/api/patients/health-metrics` | Log weight, BP, Heart rate, etc. |

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
**Base URL:** `https://your-hosted-api.com`  
**Swagger Docs:** `/docs/swagger` (Fully detailed schema)
