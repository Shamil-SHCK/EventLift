# Sponsorship Platform - Project Documentation

## 1. Project Overview
**Name**: Team-8 Sponsorship Platform
**Description**: A crowdfunding and sponsorship platform connecting students/alumni with clubs and companies.
**Tech Stack**:
- **Frontend**: React (Vite), Tailwind CSS v4 (via PostCSS), Lucide React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **File Handling**: Multer (Memory Storage), Buffer storage in MongoDB

---

## 2. Directory Structure
The project is organized into two main workspaces:
- **`frontend/`**: Contains the React + Vite application.
    - **`components/`**:
        - `EventFeed.jsx`: Shared marketplace for events.
        - `ClubDashboard.jsx`: Event creation and management.
        - `CompanyDashboard.jsx`, `AlumniDashboard.jsx`: Stats and sponsorship views.
        - `AdminPanel.jsx`, `Dashboard.jsx`, etc.
    - **`services/`**: API handling logic (`api.js`).
- **`backend/server/`**: Contains the Node.js + Express backend API.
    - **`controllers/`**: 
        - `authController.js`: User auth.
        - `eventController.js`: CRUD for events & sponsorship logic.
        - `fileController.js`: Serving images/PDFs from DB.
        - `adminController.js`: User verification.
    - **`models/`**: `User`, `Event`, `PendingUser`.
- **`package.json`**: Root configuration to run both services simultaneously.

---

## 3. Key Features & Implementation Status

### A. Authentication & User Roles
**Status**: ✅ Complete
- **Roles**: `administrator`, `club-admin`, `company`, `alumni-individual`.
- **Flow**: Registration -> Email/OTP Verification (Simulated) -> Admin Approval -> Active.

### B. Dashboard & Layouts
**Status**: ✅ Complete
- **Role-Specific Views**:
    - **`CompanyDashboard` / `AlumniDashboard`**: Displays active stats (Total Invested, Events Supported) and an integrated `EventFeed`.
    - **`ClubDashboard`**: Allows clubs to create events, upload posters/brochures, and view incoming sponsorships.
    - **`AdminDashboard`**: User verification and management.

### C. Event Management
**Status**: ✅ Complete
- **CRUD**: specific `createEvent`, `updateEvent`, `getEvents` (public), `getEventById`.
- **File Uploads**: Posters (Image) and Brochures (PDF) are uploaded and stored as binary Buffers in MongoDB.
- **Serving**: Files are served via `/api/files/event/:id/:type` endpoints.

### D. Sponsorship System
**Status**: ✅ Complete
- **Marketplace**: `EventFeed` component lists all 'open' events with search and category filters.
- **Sponsorship**: Companies/Alumni can click "Sponsor Now" to commit funds.
- **Tracking**:
    - Updates Event `raised` amount immediately.
    - Updates Sponsor's dashboard stats (Total Invested, Active Sponsorships).

### E. File Handling
**Status**: ✅ Complete
- **Strategy**: Files are stored directly in the database (`Buffer` type) to ensure portability and easier backups without external dependencies like S3 for this stage.
- **Serving**: Controlled via dedicated `fileController`.

---

## 4. API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/register` | Register new user |
| POST | `/login` | Login user & get Token |

### Events (`/api/events`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create Event (Multipart form) | Club Admin |
| GET | `/` | Get All Events | Public |
| GET | `/:id` | Get Single Event | Public |
| PUT | `/:id` | Update Event | Organizer/Admin |
| POST | `/:id/sponsor` | Sponsor Event | Company/Alumni |

### Files (`/api/files`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/event/:id/poster` | Serve Event Poster | Public |
| GET | `/event/:id/brochure` | Serve Event Brochure | Public |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/users/pending` | Get users with pending status | Admin Only |
| PUT | `/verify/:userId`| Update status (verified/rejected)| Admin Only |

---

## 5. Deployment Notes

### One-Command Start
The project uses `concurrently` to run both frontend and backend dev servers:
```bash
npm run dev
```

### Environment Variables
Required in `backend/server/.env`:
```env
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
```
