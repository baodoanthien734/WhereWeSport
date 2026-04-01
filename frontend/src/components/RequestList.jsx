import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import styles from './RequestList.module.css';

const RequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    // 1. Hàm lấy danh sách (Dùng useCallback để không bị tạo lại)
    const fetchRequests = useCallback(async (isBackground = false) => {
        try {
            // Nếu là chạy ngầm (background) thì không hiện loading spinner
            if (!isBackground) setLoading(true);
            
            const response = await api.get('/bookings/pending');
            if (response.status === 200) {
                setRequests(response.data);
            }
        } catch (error) {
            console.error("Lỗi lấy danh sách yêu cầu:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    // 2. Effect: Gọi lần đầu + Tự động refresh mỗi 30s
    useEffect(() => {
        fetchRequests(); // Gọi ngay lần đầu

        const interval = setInterval(() => {
            fetchRequests(true); // Gọi ngầm mỗi 30s
        }, 30000);

        return () => clearInterval(interval); // Dọn dẹp khi component unmount
    }, [fetchRequests]);

    // 3. Xử lý Duyệt
    const handleApprove = async (bookingId) => {
        if (!window.confirm("Bạn có chắc muốn duyệt yêu cầu này?")) return;
        
        setProcessingId(bookingId);
        try {
            const response = await api.post(`/bookings/${bookingId}/approve`);
            if (response.status === 200) {
                alert(response.data.msg);
                // Cập nhật ngay lập tức (Optimistic Update)
                setRequests(prev => prev.filter(r => r.booking_id !== bookingId));
            }
        } catch (error) {
            console.error("Lỗi duyệt:", error);
            
            // XỬ LÝ THÔNG MINH: Nếu lỗi 409 (Trùng lịch)
            if (error.response && error.response.status === 409) {
                alert("Thất bại: " + error.response.data.msg);
                // Tự động tải lại danh sách để đồng bộ dữ liệu mới nhất
                fetchRequests(); 
            } else {
                alert("Có lỗi xảy ra khi duyệt.");
            }
        } finally {
            setProcessingId(null);
        }
    };

    // 4. Xử lý Từ chối
    const handleReject = async (bookingId) => {
        if (!window.confirm("Bạn có chắc muốn TỪ CHỐI yêu cầu này?")) return;

        setProcessingId(bookingId);
        try {
            const response = await api.post(`/bookings/${bookingId}/reject`);
            if (response.status === 200) {
                alert(response.data.msg);
                setRequests(prev => prev.filter(r => r.booking_id !== bookingId));
            }
        } catch (error) {
            console.error("Lỗi từ chối:", error);
            alert("Có lỗi xảy ra khi từ chối.");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDateTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', { 
            hour: '2-digit', minute: '2-digit', 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    };

    if (loading) return <div className="text-center p-10">Đang tải danh sách yêu cầu...</div>;

    return (
        <div className={styles.container}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px'}}>
                <h3 style={{margin: 0, fontSize: '18px'}}>Danh Sách Yêu Cầu Chờ Duyệt ({requests.length})</h3>
                <button 
                    onClick={() => fetchRequests()} 
                    style={{padding: '6px 12px', fontSize: '13px', cursor: 'pointer', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px'}}
                >
                    Làm mới
                </button>
            </div>

            {requests.length === 0 ? (
                <div className={styles.emptyState}>
                    Hiện tại không có yêu cầu nào đang chờ.
                </div>
            ) : (
                <div className={styles.list}>
                    {requests.map(req => (
                        <div key={req.booking_id} className={styles.item}>
                            <div className={styles.info}>
                                <div className={styles.customerName}>
                                    {req.username} ({req.phone_number || 'Không có SĐT'})
                                </div>
                                <div className={styles.details}>
                                    Sân: <strong>{req.court_name}</strong>
                                </div>
                                <div className={styles.time}>
                                    {formatDateTime(req.start_time)} - {new Date(req.end_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                </div>
                                <div className={styles.price}>
                                    {Number(req.total_price).toLocaleString()}đ
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button 
                                    className={`${styles.btnApprove} ${processingId === req.booking_id ? styles.btnLoading : ''}`}
                                    onClick={() => handleApprove(req.booking_id)}
                                    disabled={processingId === req.booking_id}
                                >
                                    {processingId === req.booking_id ? '...' : 'Duyệt'}
                                </button>
                                <button 
                                    className={`${styles.btnReject} ${processingId === req.booking_id ? styles.btnLoading : ''}`}
                                    onClick={() => handleReject(req.booking_id)}
                                    disabled={processingId === req.booking_id}
                                >
                                    Từ chối
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RequestList;