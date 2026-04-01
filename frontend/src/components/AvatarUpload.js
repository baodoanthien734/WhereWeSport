import React, { useState, useRef } from 'react';
import api from '../services/api';
import styles from './AvatarUpload.module.css';

function AvatarUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null); 

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một file');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', selectedFile);
    try {
      setMessage('Đang tải lên...');
      const token = localStorage.getItem('token');
      const res = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage(res.data.msg);
      setSelectedFile(null); 
      if (onUploadSuccess) {
        onUploadSuccess(); 
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Lỗi khi tải ảnh lên');
      setMessage('');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (

    <div className={styles.avatarUploadContainer}>
      <input 
        type="file" 
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg"
      />
      
      <button onClick={triggerFileInput} className="action-button secondary">
        Chọn ảnh đại diện
      </button>
      
      {selectedFile && (
        <div className={styles.fileInfo}>
          <span>{selectedFile.name}</span>
          {/* Giữ lại class "action-button" global */}
          <button onClick={handleUpload} className="action-button">Tải lên</button>
        </div>
      )}
      
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AvatarUpload;