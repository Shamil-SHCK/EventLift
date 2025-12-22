# Sponsorship Platform - Project Documentation

## 1. Project Overview
**Name**: Team-8 Sponsorship Platform
**Description**: A crowdfunding and sponsorship platform connecting students/alumni with clubs and companies.
**Tech Stack**:
- **Frontend**: React (Vite), CSS Modules/Vanilla CSS (Clean Enterprise Theme)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs

---

## 2. Directory Structure
The project is organized into two main workspaces:
- **`frontend/`**: Contains the React + Vite application.
- **`backend/server/`**: Contains the Node.js + Express backend API.
- **`package.json`**: Root configuration to run both services simultaneously.
- **`README.md`** & **`PROJECT_DOCUMENTATION.md`**: Project documentation.

> **Note**: A `.gitignore` file is placed in the root to ensure `node_modules`, `.env`, and logs are not committed to version control.

---

## 3. Key Features & Implementation Status

### A. Authentication & User Roles
**Status**: ✅ Complete
- **Roles**: `administrator`, `club-admin`, `company`, `alumni-individual`.
- **Flow**:
    - **Register**: Users sign up with specific roles.
    - **Login**: Authenticates via `POST /api/auth/login`, returns JWT.
    - **Protection**: `ProtectedRoute` component in React checks for token presence.
    - **Verification**: New users start with `verificationStatus: 'pending'`.

### B. Dashboard & "Waiting Room"
**Status**: ✅ Complete
- **Logic**:
    - If `verificationStatus === 'pending'`, user sees a "Application Under Review" screen (Yellow Theme).
    - If `verificationStatus === 'rejected'`, user sees a "Application Rejected" screen (Red Theme).
    - If `verified`, user sees the main dashboard content.
- **Implementation**: Handled conditionally in `Dashboard.jsx`.

### C. Profile Management
**Status**: ✅ Complete
- **Feature**: Users can edit their details (Phone, Logo, Bio, Organization Name).
- **Password Change**: Users can securely change their passwords.
    - Requires `Current Password` for verification.
    - Validates `New Password` matches `Confirm Password` and meets length requirements.
- **Backend**: `PUT /api/auth/profile` and `PUT /api/auth/password`.
- **Frontend**: `Profile.jsx` allows users to view/save profile changes and update authentication credentials.

### D. Admin Panel
**Status**: ✅ Complete
- **Access**: Strictly restricted to users with `role: 'administrator'`.
- **Features**:
    1.  **View Pending**: default view, shows new registrations.
    2.  **Approve/Reject**: Buttons to update `verificationStatus`.
    3.  **View All Users**: Toggle filter to see entire user base.
    4.  **Password Reset**: Admin can forced-reset any user's password to `ChangeMe@123` via the "Reset PW" button (No-Email Strategy).
- **Security**: Backend `authorize('administrator')` middleware blocks unauthorized API requests. Frontend redirects unauthorized users to Login.

### E. Secure Logout
**Status**: ✅ Complete
- **Mechanism**:
    - Clears `localStorage` (Token, User Data).
    - Clears `sessionStorage`.
    - Resets React State (`users`, `user`) to prevents caching issues.
    - Redirects immediately to `/login`.

---

## 4. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user & get Token | No |
| GET | `/me` | Get current user details | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/password` | Change user password | Yes |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/users/pending` | Get users with pending status | Admin Only |
| GET | `/users` | Get ALL users | Admin Only |
| PUT | `/verify/:userId`| Update status (verified/rejected)| Admin Only |
| PUT | `/users/:userId/reset-password` | Set password to 'ChangeMe@123' | Admin Only |

---

## 5. Frontend Structure (`frontend/src`)
- **`components/`**:
    - `Login.jsx` / `Register.jsx`: Auth forms with "Clean Enterprise" styling.
    - `Dashboard.jsx`: Main landing page with "Waiting Room" logic.
    - `Profile.jsx`: User settings and Password Update form.
    - `AdminPanel.jsx`: Management interface for admins.
- **`services/`**:
    - `api.js`: Centralized fetch wrappers for all backend calls.
- **`App.jsx`**: Routing definition with `ProtectedRoute` wrappers.

---

## 6. How to Run

The project is configured with `concurrently` to run both the frontend and backend with a single command from the root directory.

### Prerequisites
- Node.js & npm installed.
- MongoDB Atlas URI or local MongoDB connection string.

### One-Command Start (Recommended)
1.  **Install Dependencies** (First time only):
    ```bash
    npm install
    # This will automatically install dependencies for root, frontend, and backend if script configured, 
    # otherwise run npm install in frontend and backend folders manually.
    ```
2.  **Start Development**:
    ```bash
    npm run dev
    ```
    - **Frontend**: http://localhost:5173
    - **Backend**: http://localhost:5000

### Manual Start
If you prefer running them separately:

**Backend**:
```bash
cd backend/server
npm run dev
```

**Frontend**:
```bash
cd frontend
npm run dev
```

---

## 7. Configuration Details

### Environment Variables (`backend/server/.env`)
The backend requires a `.env` file with:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```
> **Security Note**: This file is ignored by Git to protect sensitive credentials.

### Git Ignore
The root `.gitignore` ensures that build artifacts, logs, and `node_modules` are not pushed to the repository, keeping the codebase clean.
