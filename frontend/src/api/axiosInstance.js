import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
let inMemoryAccessToken = null;
export const setMemoryToken = (token) => {
  inMemoryAccessToken = token;
};
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});
axiosInstance.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken) {
      config.headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/signup')
    ) {
      originalRequest._retry = true;
      const refreshURL = `${API_BASE_URL}/auth/refresh`.replace('/api/api/', '/api/');
      try {
        const response = await axios.post(
          refreshURL,
          {},
          { withCredentials: true }
        );
        const newAccessToken = response.data?.data?.accessToken;
        if (newAccessToken) {
          setMemoryToken(newAccessToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        setMemoryToken(null);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
export default axiosInstance;