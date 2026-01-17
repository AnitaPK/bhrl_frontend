import api from './api';

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Fetch user info from backend using the token
 * Calls GET /api/auth/me endpoint
 */
export const fetchUserInfo = async () => {
  try {
    const response = await api.get('/auth/me');
    const user = response.data?.user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch user info:', err);
    localStorage.removeItem('user');
    return null;
  }
};

/**
 * Get cached user info from localStorage
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Set user info in localStorage (avoid using directly; use fetchUserInfo instead)
 */
export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

