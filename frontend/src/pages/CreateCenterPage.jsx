import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useOwnerStore } from '../store/ownerStore.js';
import styles from './CreateCenterPage.module.css';

const CreateCenterPage = () => {
    const navigate = useNavigate();
    const setCenter = useOwnerStore((state) => state.setCenter);

    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        center_name: '',
        contact_phone: '',
        description: '',
        address_text: '',
        latitude: '', 
        longitude: '', 
        image_url: '', 
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (!formData.center_name || !formData.contact_phone || !formData.address_text) {
            setError('Vui lòng điền đầy đủ Tên, SĐT và Địa chỉ.');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude) || 0,
                longitude: parseFloat(formData.longitude) || 0
            };

            const response = await api.post('/owner/my-center', payload);

            if (response.status === 201 || response.status === 200) {
                setCenter(response.data);
                navigate('/owner/dashboard', { replace: true });
            }

        } catch (err) {
            console.error("Lỗi tạo trung tâm:", err);
            setError(err.response?.data?.msg || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formCard}>
                <h2 className={styles.title}>Đăng Ký Trung Tâm Thể Thao</h2>
                <p className={styles.subtitle}>
                    Vui lòng nhập thông tin cơ bản để bắt đầu quản lý.
                </p>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="center_name" className={styles.label}>Tên Trung Tâm *</label>
                        <input
                            id="center_name"
                            name="center_name"
                            type="text"
                            required
                            className={styles.input}
                            placeholder="Ví dụ: Sân Cầu Lông ABC"
                            value={formData.center_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="contact_phone" className={styles.label}>Số Điện Thoại Liên Hệ *</label>
                        <input
                            id="contact_phone"
                            name="contact_phone"
                            type="tel"
                            required
                            className={styles.input}
                            placeholder="0905xxxxxx"
                            value={formData.contact_phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="address_text" className={styles.label}>Địa Chỉ *</label>
                        <textarea
                            id="address_text"
                            name="address_text"
                            required
                            className={styles.textarea}
                            placeholder="Số nhà, đường, quận/huyện..."
                            value={formData.address_text}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="description" className={styles.label}>Mô tả</label>
                        <textarea
                            id="description"
                            name="description"
                            className={styles.textarea}
                            placeholder="Giới thiệu về sân của bạn..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitButton}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận & Tạo Trung Tâm'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateCenterPage;