import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import CSS
import './App.css';

// Import Layouts
import MasterLayout from './components/MasterLayout';
import GuestLayout from './components/GuestLayout';

// Import Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UpdateProfilePage from './pages/UpdateProfilePage';

// Import Pages của Chủ Sân
import OwnerGateway from './pages/OwnerGateway';
import CreateCenterPage from './pages/CreateCenterPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

// Import Pages Đặt Sân (User)
import CenterListPage from './pages/CenterListPage';
import CenterDetailPage from './pages/CenterDetailPage';
import MyBookingPage from './pages/MyBookingPage';
// IMPORT MỚI: Trang Thanh Toán Thật
import PaymentPage from './pages/PaymentPage'; 

function App() {
  return (
    <Router>
      <Routes>
        
        {/* === NHÓM 1: KHÁCH === */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* === NHÓM 2: THÀNH VIÊN === */}
        <Route element={<MasterLayout />}>
          
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/update" element={<UpdateProfilePage />} />
          
          {/* User Booking Flow */}
          <Route path="/centers" element={<CenterListPage />} />
          <Route path="/center/:id" element={<CenterDetailPage />} />
          <Route path="/my-bookings" element={<MyBookingPage />} />
          
          {/* Trang Thanh Toán */}
          <Route path="/payment/:id" element={<PaymentPage />} /> 
          
          {/* Owner Flow */}
          <Route path="/owner" element={<OwnerGateway />} />
          <Route path="/owner/create-center" element={<CreateCenterPage />} />
          <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
          <Route path="/get-owner-access" element={<div>Trang xin cấp quyền (Đang xây dựng)</div>} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;

