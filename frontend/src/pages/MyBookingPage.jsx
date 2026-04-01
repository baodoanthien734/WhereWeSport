import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { cancelBooking } from '../services/bookingService.js';
import CountdownTimer from '../components/CountdownTimer.jsx';
import styles from './MyBookingPage.module.css';

const MyBookingPage = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Hàm lấy lịch sử
    const fetchMyBookings = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            
            const response = await api.get('/bookings/mine'); 
            if (response.data) {
                 setBookings(Array.isArray(response.data) ? response.data : response.data.bookings || []);
            }
        } catch (error) {
            console.error("Lỗi tải lịch sử:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, []);

    // 2. Effect
    useEffect(() => {
        fetchMyBookings(); 
        const interval = setInterval(() => {
            fetchMyBookings(true); 
        }, 15000); 
        return () => clearInterval(interval);
    }, [fetchMyBookings]);

    const handleCancel = async (bookingId) => {
        const confirm = window.confirm("Bạn có chắc chắn muốn hủy đơn đặt sân này không?");
        if (!confirm) return;

        try {
            await cancelBooking(bookingId);
            alert("Đã hủy đơn thành công!");
            fetchMyBookings();
        } catch (error) {
            alert(error.msg || "Có lỗi xảy ra khi hủy đơn.");
        }
    };

    const handleExpired = () => {
        console.log("Đơn hàng hết hạn, reload lại danh sách...");
        fetchMyBookings();
    };

    const formatDateTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', { 
            hour: '2-digit', minute: '2-digit', 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    };

    const renderStatus = (status) => {
        switch (status) {
            case 'Pending': return <span className={`${styles.badge} ${styles.badgePending}`}>Đang chờ duyệt</span>;
            case 'Approved_Unpaid': return <span className={`${styles.badge} ${styles.badgeApproved}`}>Đã duyệt - Chờ thanh toán</span>;
            case 'Confirmed': return <span className={`${styles.badge} ${styles.badgeConfirmed}`}>Đã thanh toán</span>;
            case 'Rejected': return <span className={`${styles.badge} ${styles.badgeRejected}`}>Bị từ chối</span>;
            case 'Cancelled': return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Đã hủy</span>;
            default: return <span>{status}</span>;
        }
    };

    const handlePayClick = (bookingId) => {
        navigate(`/payment/${bookingId}`);
    };

    if (loading && bookings.length === 0) return <div className={styles.container}>Đang tải...</div>;

    return (
        <div className={styles.container}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px'}}>
                <h1 style={{margin: 0, fontSize: '24px'}}>Lịch Sử Đặt Sân Của Tôi</h1>
                <button 
                    onClick={() => fetchMyBookings()} 
                    style={{padding: '8px 16px', cursor: 'pointer', background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px'}}
                >
                    🔄 Làm mới
                </button>
            </div>

            {bookings.length === 0 ? (
                <div className={styles.empty}>Bạn chưa đặt sân nào.</div>
            ) : (
                <div className={styles.list}>
                    {bookings.map(item => (
                        <div key={item.booking_id} className={styles.card}>
                            <div className={styles.info}>
                                <h3>{item.center_name} - {item.court_name}</h3>
                                <p>{item.address_text}</p>
                                <p className={styles.time}>
                                    {formatDateTime(item.start_time)} - {new Date(item.end_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                </p>
                                {/* Hiển thị lý do hủy nếu có */}
                                {item.status === 'Cancelled' && item.cancellation_reason && (
                                    <p style={{color: 'red', fontSize: '0.9em', marginTop: '5px'}}>
                                        <i>Lý do hủy: {item.cancellation_reason}</i>
                                    </p>
                                )}
                            </div>
                            
                            <div className={styles.statusSection} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px'}}>
                                <div className={styles.price}>
                                    {Number(item.total_price).toLocaleString()}đ
                                </div>
                                {renderStatus(item.status)}

                                
                                {/* Trường hợp 1: Đã duyệt - Hiện Đếm ngược & Thanh toán & Hủy */}
                                {item.status === 'Approved_Unpaid' && (
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', marginTop: '5px'}}>
                                        {/* Component Đếm Ngược */}
                                        <CountdownTimer 
                                            approvedAt={item.approved_at} 
                                            onExpire={handleExpired} 
                                        />

                                        <div style={{display: 'flex', gap: '8px'}}>
                                            <button 
                                                className={styles.payButton}
                                                onClick={() => handlePayClick(item.booking_id)} 
                                            >
                                                Thanh Toán Ngay
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(item.booking_id)}
                                                style={{
                                                    padding: '8px 12px',
                                                    backgroundColor: '#6c757d',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Trường hợp 2: Đang chờ duyệt - Cho phép Hủy yêu cầu */}
                                {item.status === 'Pending' && (
                                    <button 
                                        onClick={() => handleCancel(item.booking_id)}
                                        style={{
                                            marginTop: '5px',
                                            padding: '6px 10px',
                                            backgroundColor: '#dc3545', // Màu đỏ
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        Hủy Yêu Cầu
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingPage;