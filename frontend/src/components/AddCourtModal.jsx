import React, { useState } from 'react';
import api from '../services/api.js';
import { useOwnerStore } from '../store/ownerStore.js';
import styles from './AddCourtModal.module.css';

const AddCourtModal = ({ isOpen, onClose }) => {
    const addCourtToStore = useOwnerStore((state) => state.addCourt);

    const [formData, setFormData] = useState({
        court_name: '',
        court_type: 'Cầu lông', 
        price_per_hour: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.court_name || !formData.price_per_hour) {
            setError("Vui lòng điền tên sân và giá tiền.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/owner/courts', {
                ...formData,
                price_per_hour: parseFloat(formData.price_per_hour)
            });

            if (response.status === 201) {
                addCourtToStore(response.data);
                
                setFormData({ court_name: '', court_type: 'Cầu lông', price_per_hour: '' });
                
                onClose();
            }
        } catch (err) {
            console.error("Lỗi thêm sân:", err);
            setError(err.response?.data?.msg || "Lỗi server khi thêm sân.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>Thêm Sân Mới</h3>
                
                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tên sân</label>
                        <input 
                            name="court_name" 
                            type="text" 
                            className={styles.input} 
                            placeholder="Ví dụ: Sân C - VIP"
                            value={formData.court_name}
                            onChange={handleChange}
                            autoFocus
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Loại hình</label>
                        <select 
                            name="court_type" 
                            className={styles.select}
                            value={formData.court_type}
                            onChange={handleChange}
                        >
                            <option value="Cầu lông">Cầu lông</option>
                            <option value="Bóng đá (Futsal)">Bóng đá (Futsal)</option>
                            <option value="Tennis">Tennis</option>
                            <option value="Pickleball">Pickleball</option>
                            <option value="Bóng rổ">Bóng rổ</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Giá thuê mỗi giờ (VNĐ)</label>
                        <input 
                            name="price_per_hour" 
                            type="number" 
                            className={styles.input} 
                            placeholder="Ví dụ: 50000"
                            value={formData.price_per_hour}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>Hủy bỏ</button>
                        <button type="submit" disabled={isLoading} className={styles.btnSubmit}>
                            {isLoading ? 'Đang tạo...' : 'Tạo sân ngay'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCourtModal;