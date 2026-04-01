import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { createPaymentUrl, createZaloPayUrl } from '../services/paymentService.js';
import CountdownTimer from '../components/CountdownTimer.jsx';
import styles from './PaymentPage.module.css';

const PaymentPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const fetchBookingDetail = async () => {
            try {
                const response = await api.get('/bookings/mine');
                if (response.status === 200) {
                    const found = response.data.find(b => b.booking_id == id);
                    if (found) {
                        setBooking(found);
                        if (found.status !== 'Approved_Unpaid') {
                             setIsExpired(true); 
                        }
                    } else {
                        alert("Không tìm thấy đơn hàng.");
                        navigate('/my-bookings');
                    }
                }
            } catch (error) {
                console.error("Lỗi tải thông tin:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookingDetail();
    }, [id, navigate]);

    const handleExpired = () => {
        setIsExpired(true);
        alert("Đơn hàng đã hết hạn thanh toán!");
    };

    const handlePayment = async () => {
        setIsProcessing(true);
        try {
            const res = await createPaymentUrl({
                bookingId: booking.booking_id,
                amount: booking.total_price,
                bankCode: 'NCB', 
                language: 'vn'
            });

            if (res.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                alert("Lỗi: Không lấy được link thanh toán.");
            }
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
            alert("Có lỗi xảy ra khi tạo thanh toán.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleZaloPayment = async () => {
        setIsProcessing(true);
        try {
            const res = await createZaloPayUrl({
                bookingId: booking.booking_id,
                amount: booking.total_price
            });

            if (res.paymentUrl) {
                window.location.href = res.paymentUrl;
            } else {
                alert(`Lỗi ZaloPay: ${res.return_message || "Không lấy được link."}`);
            }
        } catch (error) {
            console.error("Lỗi ZaloPay:", error);
            alert("Có lỗi xảy ra khi tạo thanh toán ZaloPay.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return <div className={styles.container}>Đang tải hóa đơn...</div>;
    if (!booking) return null;

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Chọn Phương Thức Thanh Toán</h1>
                    <span className={styles.subtitle}>Mã đơn: #{booking.booking_id}</span>
                    
                    {/* HIỂN THỊ ĐỒNG HỒ ĐẾM NGƯỢC */}
                    {!isExpired && booking.status === 'Approved_Unpaid' && (
                        <div style={{marginTop: '10px'}}>
                            <CountdownTimer 
                                approvedAt={booking.approved_at} 
                                onExpire={handleExpired} 
                            />
                        </div>
                    )}
                </div>

                <div className={styles.details}>
                    <div className={styles.row}>
                        <span className={styles.label}>Sân:</span>
                        <span className={styles.value}>{booking.court_name}</span>
                    </div>
                    <div className={styles.row}>
                        <span className={styles.label}>Tổng tiền:</span>
                        <span className={styles.totalPrice}>
                            {Number(booking.total_price).toLocaleString()}đ
                        </span>
                    </div>
                </div>

                <div className={styles.actions} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {isExpired ? (
                        <div style={{color: 'red', textAlign: 'center', fontWeight: 'bold', padding: '20px', border: '1px solid red', borderRadius: '5px'}}>
                            Đơn hàng này đã hết hạn hoặc không khả dụng để thanh toán.
                            <br/>
                            <button 
                                className={styles.btnBack} 
                                onClick={() => navigate('/my-bookings')}
                                style={{ marginTop: '10px' }}
                            >
                                Quay về danh sách
                            </button>
                        </div>
                    ) : (
                        <>
                            <button 
                                className={styles.btnPay}
                                onClick={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Thanh Toán Qua VNPAY'}
                            </button>

                            <button 
                                className={styles.btnZalo}
                                style={{ 
                                    backgroundColor: '#0068FF', 
                                    color: 'white',
                                    padding: '12px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    fontWeight: 'bold',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    opacity: isProcessing ? 0.7 : 1
                                }}
                                onClick={handleZaloPayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Thanh Toán Qua ZaloPay'}
                            </button>

                            <button 
                                className={styles.btnBack} 
                                onClick={() => navigate('/my-bookings')}
                                disabled={isProcessing}
                                style={{ marginTop: '10px' }}
                            >
                                Quay lại
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;