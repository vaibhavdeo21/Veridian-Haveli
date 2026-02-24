# 🏨 Veridian Haveli - Heritage Hotel & Suites

Veridian Haveli is a premium, full-stack hotel management and reservation platform designed to deliver a 5-star digital experience for both guests and hotel administrators. 

Built with a modern MERN stack (React, Node.js, Express, MongoDB), the application features a luxurious user interface, secure authentication, real-time suite inventory management, and automated financial folio calculations.

## ✨ Key Features

### 🤵 For Guests
* **Seamless Authentication:** Secure login via traditional JWT credentials or Google OAuth.
* **Smart Booking Engine:** Real-time suite availability checking and conflict prevention.
* **Heritage Member Rewards:** Automatic 5% loyalty discount applied to returning guests based on email or database ID matching.
* **Folio Security Profile:** Guests can edit their Display Names, update credentials, and view categorized residency histories (Currently In-Residence, Future Reservations, Previous Journeys).
* **In-Room Dining:** Integrated food ordering system tied directly to the guest's specific room folio.
* **Self-Service Cancellation:** Ability to cancel upcoming reservations with strict non-refundable policy warnings for online payments.

### 🛡️ For Administrators
* **Centralized Registry:** Comprehensive dashboard to manage all active, upcoming, and past guest folios.
* **Smart Room Allocation:** Auto-suggestions for physical suite assignments based on the guest's booked category (Single, Double, Triple, Dormitory).
* **Automated Database Cleanup:** Expired or "No-Show" bookings are automatically cleared and their physical suites are immediately returned to the available inventory pool without manual intervention.
* **Financial Calculations:** Bulletproof billing logic that automatically calculates Base Rates, 18% GST, Incidentals (Food), Early Check-in fees, and Late Departure penalties.
* **Document Archiving:** Integrated Multer file uploads to securely attach and view guest ID documents (PDF/Images) directly from their folio.
* **PDF Folio Generation:** One-click automated PDF receipt generation using `jspdf` and `jspdf-autotable`.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Custom luxury color palette: Gold & Emerald)
* React Router DOM
* Context API (`AuthContext`, `DataContext`, `NotificationContext`)
* Axios (HTTP Client)
* jsPDF / autoTable (PDF Generation)
* React Google OAuth (`@react-oauth/google`)

**Backend:**
* Node.js & Express.js
* MongoDB (Mongoose ORM)
* JSON Web Tokens (JWT) & Bcrypt.js (Security/Auth)
* Multer (Multipart/form-data for ID uploads)

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone (https://github.com/vaibhavdeo21/veridian-haveli.git)
cd veridian-haveli
```

## 🚀 Project Setup Guide

### 2️⃣ Setup the Backend

Open a terminal and navigate to the backend folder:

```
cd backend
npm install
```

Create a `.env` file in the backend directory and add:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend server:

```
npm start
# or (if using nodemon)
npm run dev
```

---

### 3️⃣ Setup the Frontend

Open a new terminal and navigate to the frontend folder:

```
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Start the Vite development server:

```
npm run dev
```

---

### ✅ Done!

Your application should now be running:

- Backend → http://localhost:5000
- Frontend → http://localhost:5173  

## 📂 Key Project Structure

```
veridian-haveli/
├── backend/
│   ├── middleware/       # Auth validation, Multer file upload logic
│   ├── models/           # MongoDB Schemas (User, Booking, Room)
│   ├── routes/           # Express API endpoints (auth, bookings, etc.)
│   └── server.js         # Entry point & DB connection
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI (StayCards, Modals, Headers)
    │   │   └── admin/    # Admin-specific dashboard components
    │   ├── context/      # Global state management
    │   ├── pages/        # Main views (Home, Booking, UserProfile, Admin)
    │   └── App.jsx       # Routing & Context Providers
```

---

## 🔒 Security Notes

- All sensitive API routes are protected by **JWT authentication middleware**
- Passwords are encrypted using **Bcrypt** before being stored in MongoDB
- The frontend uses secure HTTP headers (`x-auth-token`) initialized via Axios interceptors
- Admin panels check for specific role: `admin` clearance before rendering