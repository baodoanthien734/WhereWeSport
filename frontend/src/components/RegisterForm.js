import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Thêm
import { requestOtp, verifyOtp, register } from '../services/authService';

function RegisterForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [tempToken, setTempToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Đang gửi OTP...');
    try {
      const res = await requestOtp(email);
      setMessage(res.data.msg);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi gửi OTP');
      setMessage('');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Đang xác thực OTP...');
    try {
      const res = await verifyOtp(email, otp);
      setMessage(res.data.msg);
      setTempToken(res.data.tempToken);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.msg || 'OTP không chính xác hoặc hết hạn');
      setMessage('');
    }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Đang xử lý đăng ký...');
    try {
      const res = await register(formData, tempToken);
      setMessage(res.data.msg + ". Sẽ chuyển đến trang đăng nhập sau 2 giây.");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi đăng ký');
      setMessage('');
    }
  };
  
  const renderMessages = () => (
    <>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </>
  );

  // Giao diện Bước 1
  if (step === 1) {
    return (
      <form onSubmit={handleRequestOtp} className="auth-form">
        <h2>Đăng ký (Bước 1/3)</h2>
        <p>Xác thực Email của bạn</p>
        {renderMessages()}
        <input 
          type="email" 
          name="email" 
          placeholder="Nhập email của bạn" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <button type="submit">Gửi mã OTP</button>
        <div className="form-links">
          <Link to="/" className="link">Quay lại trang chủ</Link>
        </div>
      </form>
    );
  }

  // Giao diện Bước 2
  if (step === 2) {
    return (
      <form onSubmit={handleVerifyOtp} className="auth-form">
        <h2>Đăng ký (Bước 2/3)</h2>
        <p>Mã OTP đã được gửi đến {email}.</p>
        {renderMessages()}
        <input 
          type="text" 
          name="otp" 
          placeholder="Nhập mã OTP (6 số)" 
          value={otp}
          onChange={(e) => setOtp(e.target.value)} 
          required 
        />
        <button type="submit">Xác thực</button>
        <div className="form-links">
           <a href="#!" onClick={() => setStep(1)} className="link">Gửi lại mã?</a>
           <Link to="/" className="link">Quay lại trang chủ</Link>
        </div>
      </form>
    );
  }

  // Giao diện Bước 3
  if (step === 3) {
    return (
      <form onSubmit={handleRegister} className="auth-form">
        <h2>Đăng ký (Bước 3/3)</h2>
        <p>Email đã xác thực: <strong>{email}</strong></p>
        {renderMessages()}
        <input name="username" placeholder="Tên đăng nhập" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} required />
        <button type="submit">Hoàn tất Đăng ký</button>
         <div className="form-links">
           <Link to="/" className="link">Quay lại trang chủ</Link>
        </div>
      </form>
    );
  }
}

export default RegisterForm;
