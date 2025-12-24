# Sponsorship Platform

A crowdfunding and sponsorship platform for college clubs to publish event proposals, collect micro-donations, and manage sponsors.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v4, Lucide Icons
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)

## Core Modules
1. **User Management**: 
   - Registration for Clubs, Companies, and Alumni.
   - Role-based Dashboard Access (Admin, Club Admin, Company, Alumni).
   - Verification Workflow (Admin approves/rejects users).
2. **Event Management**:
   - Clubs can create and manage events.
   - Upload Event Posters and Brochures (PDF/Images).
   - Set Budget Goals.
3. **Sponsorship System**:
   - Companies and Alumni can browse active events.
   - Commit sponsorship funds to events.
   - Track total contributions and impact.

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed and running locally (or Atlas URI)

### Quick Start (one-command)
1. **From the root directory**:
   ```bash
   npm install
   npm run dev
   ```
   This will start both the client (http://localhost:5173) and server (http://localhost:5000) concurrently.

### Manual Setup
**Server**:
1. `cd backend/server`
2. `npm install`
3. Create `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/sponsorship_platform
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. `npm run dev`

**Client**:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Usage
- **Register**: Create an account as a Club, Company, or Alumni.
- **Admin**: Login as administrator to approve new accounts.
- **Club**: Post events and track funds.
- **Sponsor**: Browse events and sponsor them.
