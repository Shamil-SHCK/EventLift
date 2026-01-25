import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './App.css';

// Lazy Load Components
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const VerifyOTP = lazy(() => import('./components/VerifyOTP'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const ClubDashboard = lazy(() => import('./components/ClubDashboard'));
const CompanyDashboard = lazy(() => import('./components/CompanyDashboard'));
const CompanyEvents = lazy(() => import('./components/CompanyEvents'));
const AlumniDashboard = lazy(() => import('./components/AlumniDashboard'));
const Profile = lazy(() => import('./components/Profile'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const CreateGigForm = lazy(() => import('./components/CreateGigForm'));
const GigOpportunities = lazy(() => import('./components/GigOpportunities'));
const GigApplicants = lazy(() => import('./components/GigApplicants'));

// Loading Fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Protected Route Component with Role-Based Access Control
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  const userRole = user.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to the appropriate dashboard based on the user's role
    switch (userRole) {
      case 'administrator':
        return <Navigate to="/admin/dashboard" replace />;
      case 'company':
        return <Navigate to="/company/dashboard" replace />;
      case 'club-admin':
        return <Navigate to="/club/dashboard" replace />;
      case 'alumni-individual':
        return <Navigate to="/alumni/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['administrator']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/events"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/dashboard"
            element={
              <ProtectedRoute allowedRoles={['club-admin']}>
                <ClubDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/alumni/dashboard"
            element={
              <ProtectedRoute allowedRoles={['alumni-individual']}>
                <AlumniDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/create-gig"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CreateGigForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/gig-opportunities"
            element={
              <ProtectedRoute allowedRoles={['club-admin']}>
                <GigOpportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/gig/:id/applicants"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <GigApplicants />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['administrator', 'company', 'club-admin', 'alumni-individual']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
