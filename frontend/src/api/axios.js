import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Unwrap { success: true, data: <payload> } envelope transparently.
// Every res.data in the app continues to work exactly as before.
API.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Unwrap error message from { success: false, message } envelope
    if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      error.response.data = { message: error.response.data.message, ...error.response.data };
    }
    return Promise.reject(error);
  }
);

export default API;
