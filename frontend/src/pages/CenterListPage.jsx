import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import styles from './CenterListPage.module.css';

const CenterListPage = () => {
    const navigate = useNavigate();
    const [centers, setCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCenters = async () => {
            try {
                const response = await api.get('/centers');
                if (response.status === 200) {
                    setCenters(response.data);
                }
            } catch (error) {
                console.error("Lỗi tải danh sách sân:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCenters();
    }, []);

    const filteredCenters = centers.filter(center => 
        center.center_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address_text.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCardClick = (centerId) => {
        navigate(`/center/${centerId}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Tìm Sân Thể Thao</h1>
                <p className={styles.subtitle}>Khám phá và đặt sân nhanh chóng, tiện lợi.</p>
            </div>

            {/* Thanh tìm kiếm */}
            <div className={styles.searchBar}>
                <input 
                    type="text" 
                    placeholder="Tìm theo tên sân hoặc địa chỉ..." 
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{textAlign: 'center'}}>Đang tải danh sách sân...</div>
            ) : (
                <>
                    {filteredCenters.length > 0 ? (
                        <div className={styles.centerGrid}>
                            {filteredCenters.map(center => (
                                <div 
                                    key={center.center_id} 
                                    className={styles.centerCard}
                                    onClick={() => handleCardClick(center.center_id)}
                                >
                                    {/* Ảnh bìa (Nếu null thì dùng ảnh placeholder) */}
                                    <img 
                                        src={center.image_url || "https://placehold.co/600x400?text=San+The+Thao"} 
                                        alt={center.center_name} 
                                        className={styles.cardImage}
                                    />
                                    
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.centerName}>{center.center_name}</h3>
                                        <p className={styles.centerAddress}>
                                            📍 {center.address_text}
                                        </p>
                                        <p style={{fontSize: '13px', color: '#666', marginBottom: '10px'}}>
                                            {center.contact_phone}
                                        </p>
                                        
                                        <button className={styles.btnBook}>
                                            Xem chi tiết & Đặt sân
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.noResult}>Không tìm thấy sân nào phù hợp.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default CenterListPage;