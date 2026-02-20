# Labloom Healthcare Backend API

Labloom is a comprehensive healthcare application backend designed to manage lab tests, doctor consultations, medical records, and patient health tracking.

## 🚀 Live Demo & API Documentation
- **Swagger Documentation:** [https://labloom.onrender.com/docs/swagger](https://labloom.onrender.com/docs/swagger)
- **Base URL:** `https://labloom.onrender.com`

## 🛠 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) with OTP Simulation
- **Documentation:** Swagger (OpenAPI 3.0)
- **Deployment:** Vercel

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
- **Premium Aesthetics**: Clean **White Aqua Blue** theme with glassmorphism and smooth transitions.

## 🔑 Authentication
Most endpoints are protected. To access them:
1. Register/Login to get a `token`.
2. Include the token in the request header:
   `Authorization: Bearer <your_token>`

## 📡 API Endpoints Summary

| Feature | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register new patient |
| **Auth** | `POST` | `/api/auth/login-otp` | Request simulation OTP |
| **Profile** | `PUT` | `/api/auth/profile` | Update health/personal data |
| **Doctors** | `GET` | `/api/doctors` | List available specialists |
| **Tests** | `GET` | `/api/tests` | Search lab tests |
| **Bookings**| `POST` | `/api/bookings` | Create new appointment |
| **Records** | `GET` | `/api/medical-records/lab-reports` | View test results |
| **Pharma**  | `POST` | `/api/medical-records/prescriptions/:id/refill` | Request medicine refill |

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
