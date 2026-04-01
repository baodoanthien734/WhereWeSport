import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function UpdateProfilePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    gender: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFormData({
          full_name: res.data.full_name || '',
          phone_number: res.data.phone_number || '',
          gender: res.data.gender || 'Khác' 
        });
      } catch (err) {
        setError('Không thể tải dữ liệu hiện tại.');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('Đang cập nhật...');
    try {
      const token = localStorage.getItem('token');
      const dataToUpdate = {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          gender: formData.gender
      };
      const res = await api.put('/profile', dataToUpdate, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessage(res.data.msg);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi cập nhật.');
      setMessage('');
    }
  };

  if (loading) return <div className="page-container">Đang tải...</div>;

  return (
    <div className="page-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Cập nhật thông tin</h2>
        
        <label>Họ và Tên</label>
        <input
          name="full_name"
          placeholder="Họ và Tên"
          value={formData.full_name}
          onChange={handleChange}
        />
        <label>Số điện thoại</label>
        <input
          name="phone_number"
          placeholder="Số điện thoại"
          value={formData.phone_number}
          onChange={handleChange}
        />
        <label>Giới tính</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
          <option value="Khác">Khác</option>
        </select>
        
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        
        <button type="submit">Lưu thay đổi</button>
        
        <div className="form-links">
          <Link to="/profile" className="link">Hủy</Link>
        </div>
      </form>
    </div>
  );
}

export default UpdateProfilePage;

