import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

function LoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    try {
      const res = await login(form);
      
      localStorage.setItem('token', res.data.token);

      navigate('/dashboard', { replace: true });

    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi đăng nhập, vui lòng thử lại.');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Đăng nhập</h2>
      <input 
        name="identifier" 
        placeholder="Tên đăng nhập hoặc Email" 
        value={form.identifier}
        onChange={handleChange} 
        required 
      />
      <input 
        type="password" 
        name="password" 
        placeholder="Mật khẩu" 
        value={form.password}
        onChange={handleChange} 
        required 
      />

      {error && <p className="error-message">{error}</p>}

      <button type="submit">Đăng nhập</button>

      <div className="form-links">
        <Link to="/forgot-password" className="link">Quên mật khẩu?</Link>
        <Link to="/register" className="link">Chưa có tài khoản? Đăng ký</Link>
      </div>
    </form>
  );
}

export default LoginForm;

