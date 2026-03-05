# 🏥 Labloom — Project Documentation

Labloom is a unified digital healthcare ecosystem connecting Patients, Doctors, Laboratories, and Hospitals. It streamlines medical consultations, diagnostic bookings, and report management with a focus on verified medical credentials and seamless document handling.

---

## 🛠️ Tech Stack

### Frontend (Web Portal)
- **Framework**: React.js (Vite)
- **Routing**: React Router DOM (Role-based Protected Routes)
- **Styling**: Vanilla CSS (Custom Design System)
- **State Management**: React Context API (`AuthContext`, `ToastContext`)
- **API Communication**: Axios (Custom `client.js` wrapper)

### Mobile (Patient App)
- **Framework**: Flutter (Dart)
- **Distribution**: iOS & Android

### Backend (API Engine)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **File Storage**: Cloudinary (Restricted to Images: JPG, PNG, WebP)
- **Authentication**: JWT (Stateless) + OTP (via Phone)
- **Mailing**: Nodemailer (SMTP Integration)

---

## 👥 User Roles & Access

| Role | Platform | Description |
| :--- | :--- | :--- |
| **Admin** | Web | Platform governance, credential verification, global reviews. |
| **Doctor** | Web | Manage consultations, slots, patients, and verify lab reports. |
| **Lab** | Web | Manage diagnostic tests, bookings, and upload patient reports. |
| **Hospital** | Web | Institutional management, doctor/slot oversight, billing/finance. |
| **Patient** | Mobile | Finding doctors/labs, booking, tracking health metrics, viewing verified reports. |

---

## 📦 Module-wise Functionalities

### 1. Unified Authentication (Auth V2)
- **OTP System**: Phone-based authentication for all roles.
- **Workflow**: `request-otp` → `verify-otp` (Admin uses a separate secure flow).
- **JWT**: Secure token-based sessions with `accessToken` and `refreshToken`.

### 2. Administrator Module
- **Dashboard**: Real-time stats on platform growth and activity.
- **Verification Desk**: View and approve/reject Doctor and Lab licensure images.
- **User Management**: Unified view of all registered users across roles.
- **Global Reviews**: Monitor and moderate feedback for doctors, labs, and hospitals.

### 3. Doctor Module
- **Credential Upload**: Submit medical registration docs for Admin approval.
- **Slot Manager**: High-precision tool to define daily/weekly availability.
- **Appointment Hub**: Track upcoming and past consultations with patients.
- **Report Verification**: Dedicated portal to review lab reports assigned to them.
- **Clinical Chat**: Secure communication with patients regarding appointments.

### 4. Laboratory Module
- **Test Management**: Add/Edit diagnostic tests with pricing and descriptions.
- **Booking Management**: Track test requests from patients.
- **Image-Only Reports**: Upload report images directly to Cloudinary.
- **Patient Notification**: Auto-mail patients when a report is uploaded or verified.

### 5. Hospital Module
- **Doctor Roster**: Add and manage resident doctors under the hospital banner.
- **Institutional Slots**: Synchronize doctor availability across the facility.
- **Financial Tracker**: Overview of billing, revenue, and appointment volume.

### 6. Patient Module (Flutter Mobile)
- **Health Onboarding**: 4-step unified onboarding (Personal, Emergency, Health, Lifestyle).
- **Discovery**: Geo-fenced search for Doctors and Labs.
- **Vitals Logger**: Log and track BP, heart rate, weight, etc., with history graphs.
- **Verified Records**: Secure access to lab reports *only after* doctor verification.

---

## 🔄 Critical End-to-End Workflows

### A. Professional Verification Flow
1. **Doctor/Lab** signs up and logs in.
2. Navigates to **Verification** page.
3. Uploads images of certificates/ID (Restricted to JPG/PNG/WebP).
4. **Admin** receives notification in "Pending Approvals".
5. Admin views docs using **DocViewerModal**.
6. Admin clicks "Approve". Access to core features (bookings/slots) is unlocked.

### B. Lab Report Lifecycle (The "Verified" Pipeline)
1. **Patient** books a test at a Lab via Mobile.
2. **Lab** completes the test and marks as "Completed".
3. Lab clicks **"Upload Report"** and selects an image.
4. **Backend logic** auto-detects the patient's most recent completed doctor appointment.
5. Report is assigned to that **Referring Doctor**; Status is set to "Under Review".
6. **Referring Doctor** logs in, reviews the image, and clicks **"Verify & Release"**.
7. **Patient** receives an automated email with the report link.
8. **Patient** can now see the "View Report" button in their mobile app.

---

## 🏗️ System Architecture

Labloom follows a **Decoupled Architecture**:

1. **Backend (`labloom_new`)**: A central REST API that serves all platforms. It handles business logic, security, and database persistence.
2. **Web Portal (`labloom-web`)**: A multi-tenant portal for service providers (Doctors, Labs, Hospitals) and Admins.
   - *Note: Patients are redirected from Web to Mobile for the primary clinical experience.*
3. **Mobile App (Flutter)**: The primary interface for patients, optimized for on-the-go health tracking and bookings.

---

## 📂 Key Directory Structures

### Backend (`labloom_new`)
- `/src/models`: Database schemas (User, Lab, Booking, Review, etc.)
- `/src/controllers`: Business logic for each module (e.g., `labPortalController.js`)
- `/src/routes`: API endpoint definitions mapped to controllers.
- `/src/config`: Third-party setups (Cloudinary, MongoDB).
- `/src/utils`: Reusable helpers (Mailer, OTP generator).

### Frontend (`labloom-web`)
- `/src/admin`, `/src/doctor`, `/src/lab`, `/src/hospital`: Role-specific pages.
- `/src/components`: Reusable UI elements (`DocViewerModal`, `Sidebar`, `Topbar`).
- `src/api/client.js`: Centralized Axios configuration for API calls.
- `App.jsx`: Master routing and role-based protection logic.

---

## 🚀 Getting Started & Installation

Follow these steps to set up the Labloom ecosystem on your local machine.

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Git**

### 2. Backend Setup (`labloom_new`)
1. Navigate to the backend directory:
   ```bash
   cd labloom_new
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `labloom_new` root and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   SMTP_EMAIL=your_email@gmail.com
   SMTP_PASSWORD=your_google_app_password
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup (`labloom-web`)
1. Navigate to the frontend directory:
   ```bash
   cd labloom-web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Update the API Base URL in `src/api/client.js` if your backend is running on a different port.
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

### 4. Mobile Setup (Flutter)
1. Ensure you have the **Flutter SDK** and **Android Studio/Xcode** installed.
2. Navigate to your Flutter project directory.
3. Fetch packages:
   ```bash
   flutter pub get
   ```
4. Run the app:
   ```bash
   flutter run
   ```

---

## 🛠️ Key Commands Summary

| Action | Location | Command |
| :--- | :--- | :--- |
| **Install All** | Root | `npm install` (in both subfolders) |
| **Start Backend** | `labloom_new` | `npm run dev` |
| **Start Web** | `labloom-web` | `npm run dev` |
| **Build Web** | `labloom-web` | `npm run build` |
