# Sponsorship Platform

A crowdfunding and sponsorship platform for college clubs to publish event proposals, collect micro-donations, and manage sponsors.

## Tech Stack
- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB

## User Registration & Authentication Module
This module includes:
- User Registration (Students, Clubs, Sponsors)
- User Login (JWT Authentication)
- Protected Dashboard
- Client-side Routing

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### Server Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the server directory with the following:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/sponsorship_platform
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Quick Start (Run Both)
1. **From the root directory**:
   ```bash
   npm install
   npm run dev
   ```
   This will start both the client (port 5173) and server (port 5000) concurrently.

### Client Setup (Manual)
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and visit `http://localhost:5173` (or the URL shown in the terminal).

## Usage
- **Register**: Create a new account.
- **Login**: Log in with your credentials.
- **Dashboard**: View your profile information (Protected Route).
