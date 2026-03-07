# Labloom — Healthcare & Diagnostics Platform

Labloom is a premium, full-stack healthcare application designed for seamless interaction between Patients, Doctors, and Diagnostic Laboratories. It features a modern **Aqua Blue** design and a closed-loop medical reporting system.

## 🌟 Key Features

- **🛡️ Secure Onboarding**: Role-based access for Patients, Doctors, Hospitals, and Labs with OTP-based authentication.
- **🩺 Doctor Consultations**: Search for specialists, book appointments, and maintain clinical histories.
- **📱 Flutter Patient App**: The patient experience is designed for mobile integration (see the [Patient Mobile API Guide](./Labloom-Assets/PATIENT_MOBILE_API.md)).
- **🧪 Integrated Lab Workflow**: 
    - 🧪 **Labs**: Manage bookings and upload digital reports.
    - 🩺 **Doctors**: Review and verify reports before patient release.
    - 👤 **Patients**: Access verified results on mobile.
- **💬 Professional Messaging**: Real-time chat between doctors and patients (available for 7 days post-appointment).
- **🎨 Premium UI**: A clean, professional "White Aqua Blue" theme for the provider portals (Doctor, Lab, Admin).

---

## 🚀 Recent Updates

- **📄 Native PDF Rendering**: Integrated Google Docs Viewer as the default fallback to seamlessly display PDF medical reports without requiring downloads.
- **✨ Redesigned Entity Cards**: Modern, visually appealing presentation for Doctors, Labs, and Hospitals with soft shadows, prominent profiles, and one-click sharing via the Web Share API (`navigator.share`).
- **🛡️ Provider Verification Pipeline**: Robust system allowing doctors and labs to securely upload licensure documents directly on the portal for Admin review.

---

## 📂 Repository Structure

```text
Labloom/
├── labloom-web/       # Frontend (React + Vite)
├── labloom_new/       # Backend (Node.js + Express + MongoDB)
└── Labloom-Assets/    # Documentation & Mobile API
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

## 📜 Documentation

For a comprehensive guide on the platform's architecture, functionalities, and module-wise working, please refer to the following:

- **📄 [Full Project Documentation](./PROJECT_DOCUMENTATION.md)**: End-to-end functionalities, tech stack, and module details.
- **📱 [Patient Mobile API Guide](./Labloom-Assets/PATIENT_MOBILE_API.md)**: Flutter integration guide for mobile app developers.

---

## 🚀 Getting Started

To set up the Labloom ecosystem on your local machine, please follow the detailed instructions in the **[Installation Guide](./PROJECT_DOCUMENTATION.md#🚀-getting-started--installation)**.

### Quick Commands:
- **Backend Setup**: `cd labloom_new && npm install && npm run dev`
- **Web Frontend Setup**: `cd labloom-web && npm install && npm run dev`

---

## 📋 Deployment & Links

- **Live Backend API**: [https://labloom.onrender.com](https://labloom.onrender.com)
- **Interactive API Docs (Swagger)**: [https://labloom-new.onrender.com/docs/swagger](https://labloom-new.onrender.com/docs/swagger)

This project is optimized for deployment on **Render** (Backend) and **Vercel/Netlify** (Frontend).
Ensure all **Environment Variables** (MongoDB, JWT, Cloudinary, SMTP) are configured in your hosting provider's dashboard.

---

© 2026 Labloom Healthcare Team.
