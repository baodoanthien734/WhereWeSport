import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import AvatarUpload from '../components/AvatarUpload';
import styles from './ProfilePage.module.css';

const ProfileField = ({ label, value }) => (
  <div className={styles.profileField}>
    <span className={styles.profileLabel}>{label}:</span>
    <span className={styles.profileValue}>{value || 'Chưa cập nhật'}</span>
  </div>
);

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true); 
      setError('');
      
      const token = localStorage.getItem('token');
      const res = await api.get('/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setProfile(res.data);
    } catch (err) {
      setError('Không thể tải thông tin cá nhân.');
      console.error(err); 
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]); 
  
  const handleUploadSuccess = () => {
    fetchProfile(); 
  };

  if (loading) {
    return <div className="page-container">Đang tải...</div>;
  }
  
  if (error) {
    return <div className="page-container error-message">{error}</div>;
  }
  
  if (!profile) {
    return <div className="page-container">Không tìm thấy thông tin.</div>;
  }

  const backendUrl = api.defaults.baseURL.replace('/api', '');

  return (
    <div className={`page-container ${styles.profilePage}`}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <img 
            src={profile.avatar_url ? `${backendUrl}${profile.avatar_url}` : 'https://placehold.co/120x120?text=Avatar'} 
            alt="Avatar" 
            className={styles.profileAvatarLarge}
          />
          <h2>{profile.username}</h2>
          <p>{profile.email}</p>
        </div>
        
        <div className={styles.profileDetails}>
          <h3>Thông tin chi tiết</h3>
          <ProfileField label="Họ và Tên" value={profile.full_name} />
          <ProfileField label="Số điện thoại" value={profile.phone_number} />
          <ProfileField label="Giới tính" value={profile.gender} />
        </div>
        
        <div className={styles.profileActions}>
           <Link to="/profile/update" className={styles.actionButton}>Cập nhật thông tin</Link>
           <AvatarUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="form-links"> 
           <Link to="/dashboard" className="link">Quay lại Bảng tin</Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;