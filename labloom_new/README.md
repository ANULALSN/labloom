# Labloom Healthcare Backend API

Labloom is a comprehensive healthcare application backend designed to manage lab tests, doctor consultations, medical records, and patient health tracking.

## 🚀 Live Demo & API Documentation
- **Swagger Documentation:** [https://labloom.onrender.com/docs/swagger](https://labloom.onrender.com/docs/swagger)
- **Base URL:** `https://labloom.onrender.com`

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) with OTP (V2 Auth)
- **Documentation:** Swagger (OpenAPI 3.0)
- **Deployment:** Render (labloom.onrender.com)

## 📂 Project Structure
```text
Labloom/
├── src/
│   ├── config/             # Database & Swagger configurations
│   ├── controllers/        # Business logic for each resource
│   ├── middleware/         # Auth protection & error handlers
│   ├── models/             # Mongoose schemas (User, Booking, Doctor, Test, etc.)
│   ├── routes/             # API route definitions with Swagger JSDoc
│   └── index.js            # Main entry point
├── vercel.json             # Vercel deployment configuration
└── package.json            # Dependencies and scripts
```

## ✨ Key Features

### 1. Identity & Onboarding
- **OTP Auth:** Simulated SMS/Email OTP login for secure access.
- **Multi-step Profile:** Detailed patient data collection (Personal, Emergency, Health Profiling, Lifestyle).

### 2. Clinical Discovery
- **Lab Tests:** Search and filter laboratory tests by category (Hormonal, Lipid, etc.).
- **Doctor Directory:** Profiles for specialists with rating, bio, and availability.

### 3. Booking Management
- **Unified Engine:** Book both Lab Tests and Doctor Consultations (In-person or Video).
- **History:** Comprehensive list of past and upcoming appointments.

### 4. Medical Records (EHR) & Lab Workflow
- **Clinical Closed-Loop**: Labs upload reports, but they remain **hidden** from patients until a **Doctor verifies** them.
- **Visit Summaries:** Detailed post-consultation notes (Symptoms, Diagnosis, Prescriptions).
- **Lab Reports:** Digital test results with **Verified by Doctor** status indicators.
- **Prescriptions:** Active medication tracking with **Refill Request** and **Reminders**.

### 5. Health Tracking & UI
- **Vitals Monitoring:** Track Blood Pressure, Weight, Heart Rate, and Oxygen Saturation.
- **Daily Habits:** Log Sleep and Water Intake.
- **Premium Aesthetics**: Professional **Green Healthcare** theme with clean typography and smooth transitions.

## 🔑 Authentication
Most endpoints are protected. To access them:
1. Register/Login to get a `token`.
2. Include the token in the request header:
   `Authorization: Bearer <your_token>`

## 📡 API Endpoints Summary

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/v2/request-otp` | Request OTP for login |
| **Auth** | `POST` | `/api/auth/v2/verify-otp` | Verify OTP & Get Tokens |
| **Onboarding**| `PATCH` | `/api/patients/health-profile` | Unified 4-Step Patient Data |
| **Profile** | `GET` | `/api/patients/me` | Fetch personal health data |
| **Doctors** | `GET` | `/api/patients/doctors` | List available specialists |
| **Labs** | `GET` | `/api/patients/labs` | Search available laboratories |
| **Bookings**| `POST` | `/api/patients/bookings` | Create new appointment/test |
| **Records** | `GET` | `/api/patients/reports` | View verified test results |

## 🛠 Installation & Local Setup

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:** Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. **Run Development Server:**
   ```bash
   npm run dev
   ```
5. **Seed Initial Data:**
   - POST `/api/tests/seed`
   - POST `/api/doctors/seed`

## 📦 Vercel Deployment

This project is optimized for serverless deployment. Simply connect your repository to Vercel, and it will automatically detect the `vercel.json` configuration.

---
© 2026 Labloom Healthcare. All rights reserved.
