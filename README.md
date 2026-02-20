# Labloom — Healthcare & Diagnostics Platform

Labloom is a premium, full-stack healthcare application designed for seamless interaction between Patients, Doctors, and Diagnostic Laboratories. It features a modern **Aqua Blue** design and a closed-loop medical reporting system.

## 🌟 Key Features

- **🛡️ Secure Onboarding**: Role-based access for Patients, Doctors, Hospitals, and Labs with OTP-based authentication.
- **🩺 Doctor Consultations**: Search for specialists, book appointments, and maintain clinical histories.
- **🧪 Integrated Lab Workflow**: 
    - Patients can browse tests and book lab visits.
    - Labs can manage bookings and upload digital reports.
    - **Doctor Verification**: Reports are reviewed and verified by doctors before being released to patients.
- **💬 Professional Messaging**: Real-time chat between doctors and patients (available for 7 days post-appointment).
- **📊 Health Dashboard**: Personalized overview of upcoming visits, recent clinical activity, and vital health metrics.
- **🎨 Premium UI**: A clean, professional "White Aqua Blue" theme designed for medical environments.

---

## 📂 Repository Structure

```text
Labloom/
├── labloom-web/       # Frontend (React + Vite)
└── labloom_new/       # Backend (Node.js + Express + MongoDB)
```

---

## 🛠️ Tech Stack

**Frontend:**
- React 18+
- Vite (Build Tool)
- Vanilla CSS (Custom Design System)
- React Router DOM (Navigation)

**Backend:**
- Node.js & Express
- MongoDB (Mongoose ODM)
- JWT Authentication
- Multer (File Uploads)
- Swagger (API Documentation)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd labloom_new
npm install
# Create a .env file based on the instructions in the labloom_new directory
npm run dev
```

### 3. Frontend Setup
```bash
cd labloom-web
npm install
# Create a .env.local file with VITE_API_URL=http://localhost:5000
npm run dev
```

---

## 📋 Deployment Note

This project is ready for deployment on platforms like **Render** (Backend) and **Vercel/Netlify** (Frontend).
- Ensure the `VITE_API_URL` environment variable is set in your frontend hosting.
- Ensure `MONGO_URI` and `JWT_SECRET` are set in your backend hosting.

---
© 2026 Labloom Healthcare Team.
