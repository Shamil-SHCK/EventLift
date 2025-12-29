const API_URL = 'http://localhost:5000/api';

// Register user
export const registerUser = async (userData) => {
  const isFormData = userData instanceof FormData;

  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers,
    body: isFormData ? userData : JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  // NOTE: We don't save token here anymore because of OTP flow

  return data;
};

// Verify OTP
export const verifyUserOTP = async (data) => {
  const response = await fetch(`${API_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'OTP verification failed');
  }

  // Save token to localStorage
  if (responseData.token) {
    localStorage.setItem('token', responseData.token);
    localStorage.setItem('user', JSON.stringify(responseData));
  }

  return responseData;
};

// Login user
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // Save token to localStorage
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
  }

  return data;
};

// Get current user
export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('No token found');
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to get user data');
  }

  return data;
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear(); // Ensure all session data is cleared
};

// Admin: Get pending users
export const getPendingUsers = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/users/pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch pending users');
  }

  return data;
};

// Admin: Get all users
export const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }

  return data;
};

// Admin: Reset User Password
export const resetUserPassword = async (userId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/users/${userId}/reset-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reset password');
  }

  return data;
};

// Admin: Verify user
export const verifyUser = async (userId, status) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/verify/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user status');
  }

  return data;
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data;
};

// Change user password
export const changeUserPassword = async (passwordData) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password');
  }

  return data;
};

// --- EVENT APIs ---

// Create new event
export const createEvent = async (eventData) => {
  const token = localStorage.getItem('token');

  // eventData is expected to be FormData since we have file uploads
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Type is NOT set manually for FormData, browser sets it with boundary
    },
    body: eventData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to create event');
  }

  return data;
};

// Get all events
export const getEvents = async () => {
  // Public route, but we send token if available for role checks if needed later
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/events`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch events');
  }

  return data;
};

// Get single event
export const getEventById = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch event');
  }

  return data;
};

// Update event
export const updateEvent = async (id, eventData) => {
  const token = localStorage.getItem('token');

  // Check if eventData is FormData (files included) or JSON
  const isFormData = eventData instanceof FormData;
  const headers = { Authorization: `Bearer ${token}` };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'PUT',
    headers: headers,
    body: isFormData ? eventData : JSON.stringify(eventData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update event');
  }

  return data;
};

// Sponsor event
export const sponsorEvent = async (id, amount) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}/sponsor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to sponsor event');
  }

  return data;
};

// Delete event
export const deleteEvent = async (id) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/events/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete event');
  }

  return data;
};
