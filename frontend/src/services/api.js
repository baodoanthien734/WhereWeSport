import axios from 'axios';
import useAuthStore from '../store/authStore'; 

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});


api.interceptors.request.use(
  (config) => {

    const token = useAuthStore.getState().token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; 
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("API Interceptor: Lỗi 401. Token hết hạn. Đang đăng xuất...");

      useAuthStore.getState().logout();

      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;