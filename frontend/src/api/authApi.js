import axiosInstance from './axiosInstance';
export const signupApi = async (userData) => {
  const response = await axiosInstance.post('/auth/signup', userData);
  return response.data;
};
export const loginApi = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};
export const logoutApi = async () => {
  const response = await axiosInstance.post('/auth/logout');
  return response.data;
};
export const refreshApi = async () => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};
export const getProfileApi = async () => {
  const response = await axiosInstance.get('/user/profile');
  return response.data;
};
export const getDashboardApi = async () => {
  const response = await axiosInstance.get('/dashboard');
  return response.data;
};