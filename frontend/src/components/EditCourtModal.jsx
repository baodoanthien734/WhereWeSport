import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useOwnerStore } from '../store/ownerStore.js';
import styles from './EditCourtModal.module.css';

const EditCourtModal = ({ isOpen, onClose, courtToEdit }) => {
    const updateCourtInStore = useOwnerStore((state) => state.updateCourt);
    const deleteCourtInStore = useOwnerStore((state) => state.deleteCourt);

    const [formData, setFormData] = useState({
        court_name: '',
        court_type: '',
        price_per_hour: '',
        status: 'Active'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (courtToEdit) {
            setFormData({
                court_name: courtToEdit.court_name,
                court_type: courtToEdit.court_type,
                price_per_hour: courtToEdit.price_per_hour,
                status: courtToEdit.status || 'Active'
            });
        }
    }, [courtToEdit]);

    if (!isOpen || !courtToEdit) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await api.put(`/owner/courts/${courtToEdit.court_id}`, {
                ...formData,
                price_per_hour: parseFloat(formData.price_per_hour)
            });

            if (response.status === 200) {
                updateCourtInStore(response.data.data); 
                onClose();
            }
        } catch (err) {
            console.error("Lỗi sửa sân:", err);
            setError(err.response?.data?.msg || "Lỗi server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            `Bạn có chắc chắn muốn xóa sân "${courtToEdit.court_name}" không?\nHành động này sẽ ẩn sân khỏi danh sách.`
        );

        if (!confirmDelete) return;

        setIsLoading(true);
        try {
            const response = await api.delete(`/owner/courts/${courtToEdit.court_id}`);
            
            if (response.status === 200) {
                deleteCourtInStore(courtToEdit.court_id);
                onClose();
            }
        } catch (err) {
            console.error("Lỗi xóa sân:", err);
            alert("Không thể xóa sân. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>Chỉnh Sửa Sân</h3>
                
                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tên sân</label>
                        <input 
                            name="court_name" type="text" className={styles.input} 
                            value={formData.court_name} onChange={handleChange} required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Loại hình</label>
                        <select 
                            name="court_type" className={styles.select}
                            value={formData.court_type} onChange={handleChange}
                        >
                            <option value="Cầu lông">Cầu lông</option>
                            <option value="Bóng đá (Futsal)">Bóng đá (Futsal)</option>
                            <option value="Tennis">Tennis</option>
                            <option value="Pickleball">Pickleball</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Giá thuê mỗi giờ (VNĐ)</label>
                        <input 
                            name="price_per_hour" type="number" className={styles.input} 
                            value={formData.price_per_hour} onChange={handleChange} required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Trạng thái</label>
                        <select 
                            name="status" className={styles.select}
                            value={formData.status} onChange={handleChange}
                        >
                            <option value="Active">Hoạt động (Active)</option>
                            <option value="Maintenance">Đang bảo trì (Maintenance)</option>
                        </select>
                    </div>

                    <div className={styles.actions}>
                        {/* Nút Xóa nằm bên trái */}
                        <button type="button" onClick={handleDelete} className={styles.btnDelete}>
                            Xóa sân này
                        </button>

                        <div className={styles.rightActions}>
                            <button type="button" onClick={onClose} className={styles.btnCancel}>Hủy</button>
                            <button type="submit" disabled={isLoading} className={styles.btnSubmit}>
                                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCourtModal;