import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import styles from './BookingModal.module.css';
import { formatDateForAPI } from '../utils/dateUtils.js';

const BookingModal = ({ isOpen, onClose, court, defaultDate, onSuccess }) => {
    const isOwner = true; 

    const [selectedDate, setSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('07:00');
    const [duration, setDuration] = useState(1);
    const [customerName, setCustomerName] = useState('');
    const [paymentAmount, setPaymentAmount] = useState(0);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && court && defaultDate) {
            setSelectedDate(formatDateForAPI(defaultDate));
            setStartTime('07:00');
            setDuration(1);
            setCustomerName('');
            setPaymentAmount(0);
            setError('');
            setIsLoading(false);
        }
    }, [isOpen, court, defaultDate]); 

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
        setIsLoading(true);

        try {
            const fullStartTime = `${selectedDate}T${startTime}:00`;

            const payload = {
                court_id: court.court_id,
                start_time: fullStartTime,
                duration: parseFloat(duration),
                customer_name_offline: isOwner ? customerName : null,
                payment_amount: parseFloat(paymentAmount) || 0
            };

            const response = await api.post('/bookings', payload);

            if (response.status === 201) {
                alert(response.data.msg);
                onSuccess(); 
                onClose(); 
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
                <h3 className={styles.title}>Đặt Sân Nhanh</h3>

                <div className={styles.courtInfo}>
                    <strong>Sân:</strong> {court.court_name} <br/>
                    <div style={{marginTop: '8px'}}>
                        <label style={{fontWeight: 'bold', marginRight: '10px'}}>Ngày:</label>
                        <input 
                            type="date" 
                            className={styles.input} 
                            style={{width: 'auto', padding: '4px 8px'}}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Bắt đầu lúc</label>
                            <input 
                                type="time" 
                                className={styles.input}
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Thời lượng (h)</label>
                            <input 
                                type="number" 
                                step="0.5" 
                                min="0.5" 
                                className={styles.input}
                                value={duration}
                                onChange={(e) => setDuration(parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Tên khách / Ghi chú</label>
                        <input 
                            type="text" className={styles.input}
                            placeholder="Ví dụ: Anh Ba (SĐT...)"
                            value={customerName} 
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>

                    <div className={styles.calculationBox}>
                        <div className={styles.calcRow}>
                            <span>Kết thúc (dự kiến):</span> <strong>{calculation.endTime}</strong>
                        </div>
                        <div className={`${styles.calcRow} ${styles.calcTotal}`}>
                            <span>Tổng tiền:</span> <span>{calculation.totalPrice.toLocaleString()}đ</span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Khách trả trước (vnđ)</label>
                        <input 
                            type="number" className={styles.input}
                            placeholder="0"
                            value={paymentAmount} 
                            onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.btnCancel}>Hủy</button>
                        <button type="submit" disabled={isLoading} className={styles.btnSubmit}>
                            {isLoading ? '...' : 'Xác nhận'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;