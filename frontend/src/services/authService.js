import api from './api';
import useAuthStore from '../store/authStore';
import {useOwnerStore} from '../store/ownerStore';
export const login = async (credentials) => {
  try {
    const loginResponse = await api.post('/auth/login', credentials);
    const { token } = loginResponse.data;

    const profileResponse = await api.get('/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const user = profileResponse.data;

    useAuthStore.getState().setLoginData(token, user);
    
    return loginResponse;

  } catch (error) {
    console.error("Lỗi authService.login:", error);
    throw error;
  }
};

export const logout = async () => {
  console.log("AuthService: Bắt đầu logout...");
  try {
    useOwnerStore.getState().clearCenter();
    localStorage.removeItem('owner-storage'); 

    await useAuthStore.persist.clearStorage();
    useAuthStore.getState().logout();
    
    console.log("AuthService: Đã dọn dẹp toàn bộ state.");
  } catch (error) {
    console.error("Lỗi khi logout:", error);
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('owner-storage');
    window.location.href = '/login';
  }
};


export const requestOtp = (email) => {
  return api.post('/auth/request-otp', { email });
};

export const verifyOtp = (email, otp) => {
  return api.post('/auth/verify-otp', { email, otp });
};

export const register = (formData, tempToken) => {
  return api.post('/auth/register', formData, {
    headers: { 'Authorization': `Bearer ${tempToken}` }
  });
};