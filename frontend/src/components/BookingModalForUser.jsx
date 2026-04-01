import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import styles from './BookingModal.module.css';
import { formatDateForAPI, generateTimeSlots } from '../utils/dateUtils.js';

const BookingModalForUser = ({ isOpen, onClose, court, defaultDate, onSuccess }) => {
    const navigate = useNavigate();

    const [startTime, setStartTime] = useState('07:00');
    const [duration, setDuration] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const timeSlots = useMemo(() => generateTimeSlots(), []);

    useEffect(() => {
        if (isOpen) {
            setStartTime('07:00');
            setDuration(1);
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);

    const calculation = useMemo(() => {
        if (!court) return { endTime: '', totalPrice: 0 };
        const [hours, minutes] = startTime.split(':').map(Number);
        const startTotalMinutes = hours * 60 + minutes;
        const endTotalMinutes = startTotalMinutes + (duration * 60);
        const endH = Math.floor(endTotalMinutes / 60) % 24;
        const endM = Math.floor(endTotalMinutes % 60);
        const endTimeStr = `${endH}:${endM.toString().padStart(2, '0')}`;
        const totalPrice = Number(court.price_per_hour) * duration;
        return { endTime: endTimeStr, totalPrice };
    }, [startTime, duration, court]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const dateStr = formatDateForAPI(defaultDate);
        const fullStartTimeStr = `${dateStr}T${startTime}:00`;
        const bookingTime = new Date(fullStartTimeStr);
        const now = new Date();

        if (bookingTime <= now) {
            setError("Không thể đặt thời gian trong quá khứ hoặc hiện tại. Vui lòng chọn giờ tương lai.");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                court_id: court.court_id,
                start_time: fullStartTimeStr,
                duration: parseFloat(duration),
                customer_name_offline: null,
                payment_amount: 0
            };

            const response = await api.post('/bookings', payload);

            if (response.status === 201) {
                if (window.confirm("Đã gửi yêu cầu thành công! Chuyển đến trang quản lý để theo dõi trạng thái?")) {
                    onClose();
                    navigate('/my-bookings'); 
                } else {
                    onSuccess(); 
                    onClose();
                }
            }

        } catch (err) {
            console.error("Lỗi đặt sân:", err);
            setError(err.response?.data?.msg || "Lỗi server.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !court) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <h3 className={styles.title}>Gửi Yêu Cầu Đặt Sân</h3>

                <div className={styles.courtInfo}>
                    <strong>Sân:</strong> {court.court_name} <br/>
                    <strong>Ngày:</strong> {formatDateForAPI(defaultDate)}
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Giờ Bắt Đầu</label>
                            <select 
                                className={styles.select}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            >
                                {timeSlots.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Thời lượng</label>
                            <select 
                                className={styles.select}
                                value={duration} 
                                onChange={(e) => setDuration(parseFloat(e.target.value))}
                            >
                                <option value={1}>1 tiếng</option>
                                <option value={1.5}>1.5 tiếng</option>
                                <option value={2}>2 tiếng</option>
                                <option value={2.5}>2.5 tiếng</option>
                                <option value={3}>3 tiếng</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.calculationBox}>
                        <div className={styles.calcRow}>
                            <span>Kết thúc:</span> <strong>{calculation.endTime}</strong>
                        </div>
                        <div className={styles.calcRow}>
                            <span>Đơn giá:</span> <span>{Number(court.price_per_hour).toLocaleString()}đ/h</span>
                        </div>
                        <div className={`${styles.calcRow} ${styles.calcTotal}`}>
                            <span>Dự kiến thanh toán:</span> 
                            <span style={{color: '#4f46e5'}}>{calculation.totalPrice.toLocaleString()}đ</span>
                        </div>
                        <p style={{fontSize: '12px', color: '#666', fontStyle: 'italic', marginTop: '5px'}}>
                            * Lưu ý: Đây chỉ là yêu cầu đặt sân. Lịch của bạn sẽ hiện màu Vàng (Chờ duyệt) cho đến khi chủ sân xác nhận.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>Hủy</button>
                        <button type="submit" disabled={isLoading} className={styles.btnSubmit}>
                            {isLoading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModalForUser;