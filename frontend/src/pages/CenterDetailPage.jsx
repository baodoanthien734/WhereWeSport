import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';
import styles from './CenterDetailPage.module.css';
import { getStartOfWeek, addDays, isSameDay, formatMonthYear, getDayNameVN, formatDateForAPI } from '../utils/dateUtils.js';

import BookingModalForUser from '../components/BookingModalForUser.jsx';

const CenterDetailPage = () => {
    const { id } = useParams();
    
    const [center, setCenter] = useState(null);
    const [courts, setCourts] = useState([]);
    const [selectedCourtId, setSelectedCourtId] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const today = useMemo(() => new Date(), []);
    const [currentViewDate, setCurrentViewDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState(today);

    const weekDays = useMemo(() => {
        const startOfWeek = getStartOfWeek(currentViewDate);
        return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
    }, [currentViewDate]);

    const currentWeekStart = useMemo(() => getStartOfWeek(new Date()), []);
    const viewingWeekStart = getStartOfWeek(currentViewDate);
    const isPastWeek = viewingWeekStart <= currentWeekStart;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [centerRes, courtsRes] = await Promise.all([
                    api.get(`/centers/${id}`),
                    api.get(`/centers/${id}/courts`)
                ]);

                if (centerRes.status === 200) setCenter(centerRes.data);
                if (courtsRes.status === 200) {
                    setCourts(courtsRes.data);
                    if (courtsRes.data.length > 0) {
                        setSelectedCourtId(courtsRes.data[0].court_id);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải chi tiết sân:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const loadBookings = async () => {
        if (!selectedCourtId) return;
        try {
            const dateStr = formatDateForAPI(selectedDate);
            const response = await api.get(`/centers/bookings?courtId=${selectedCourtId}&date=${dateStr}`);
            if (response.status === 200) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error("Lỗi tải lịch:", error);
        }
    };

    useEffect(() => {
        loadBookings();
    }, [selectedCourtId, selectedDate]);

    const selectedCourt = courts.find(c => c.court_id === selectedCourtId);

    const renderCalendarRows = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const bookingMap = {};

        bookings.forEach(booking => {
            const start = new Date(booking.start_time);
            const end = new Date(booking.end_time);
            
            const startHour = start.getHours(); 
            const startMin = start.getMinutes();
            const endHour = end.getHours();
            const endMin = end.getMinutes();

            let durationRaw = (end - start) / (1000 * 60 * 60);
            
            const startTimeStr = `${startHour}:${startMin.toString().padStart(2, '0')}`;
            const endTimeStr = `${endHour}:${endMin.toString().padStart(2, '0')}`;
            const displayTime = `${startTimeStr} - ${endTimeStr}`;
            const durationDisplay = durationRaw % 1 === 0 ? durationRaw + 'h' : durationRaw.toFixed(1) + 'h';

            bookingMap[startHour] = { 
                ...booking, 
                displayTime, 
                durationText: durationDisplay 
            };
        });

        return hours.map(hour => {
            const booking = bookingMap[hour];

            return (
                <tr key={hour} className={styles.calendarRow}>
                    <td className={styles.timeLabel}>{hour}h</td>
                    {booking ? (
                        <td className={styles.cell}>
                            {/* LOGIC HIỂN THỊ MÀU SẮC */}
                            {booking.status === 'Approved_Unpaid' ? (
                                <div className={`${styles.bookingBlock} ${styles.blockUnpaid}`}>
                                    <strong>Đang giữ chỗ</strong>
                                    <span>(Chờ thanh toán)</span>
                                    <span>{booking.displayTime}</span>
                                </div>
                            ) : (
                                <div className={`${styles.bookingBlock} ${styles.blockBusy}`}>
                                    <strong>Đã có người đặt</strong>
                                    <span>{booking.displayTime}</span>
                                </div>
                            )}
                        </td>
                    ) : (
                        <td 
                            className={`${styles.cell} hover:bg-blue-50 cursor-pointer`} 
                            onClick={() => {
                                if (selectedCourt && selectedCourt.status === 'Active') {
                                    setIsBookingModalOpen(true);
                                } else {
                                    alert("Sân này đang bảo trì, không thể đặt.");
                                }
                            }}
                        >
                        </td>
                    )}
                </tr>
            );
        });
    };

    if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Đang tải dữ liệu...</div>;
    if (!center) return <div style={{textAlign: 'center', padding: '50px'}}>Không tìm thấy trung tâm.</div>;

    const isMaintenance = selectedCourt?.status === 'Maintenance';

    return (
        <div className={styles.container}>
            <div className={styles.heroSection}>
                <img src={center.image_url || "https://placehold.co/1200x300?text=San+The+Thao"} className={styles.coverImage} alt="Cover" />
                <div className={styles.centerInfo}>
                    <div className={styles.infoCard}>
                        <div>
                            <h1 className={styles.title}>{center.center_name}</h1>
                            <p className={styles.address}>📍 {center.address_text}</p>
                            <p className={styles.phone}>📞 {center.contact_phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.mainLayout}>
                
                <div className={styles.sidebar}>
                    <h3 className={styles.sidebarTitle}>Danh sách sân</h3>
                    
                    <div className={styles.courtList}>
                        {courts.map(court => (
                            <div 
                                key={court.court_id}
                                className={`${styles.courtItem} ${selectedCourtId === court.court_id ? styles.courtItemActive : ''}`}
                                onClick={() => setSelectedCourtId(court.court_id)}
                            >
                                <div className={styles.courtName}>{court.court_name}</div>
                                <div className={styles.courtPrice}>{Number(court.price_per_hour).toLocaleString()}đ/h</div>
                                <div style={{fontSize: '12px', color: court.status === 'Active' ? 'green' : 'red'}}>
                                    {court.status === 'Active' ? '• Sẵn sàng' : '• Bảo trì'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* NÚT ĐẶT SÂN */}
                    <button 
                        className={styles.bookBtnSidebar}
                        onClick={() => setIsBookingModalOpen(true)}
                        disabled={!selectedCourt || isMaintenance}
                        style={{
                            backgroundColor: isMaintenance ? '#9ca3af' : '#4f46e5',
                            cursor: isMaintenance ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isMaintenance ? 'Đang Bảo Trì' : 'Đặt Sân Ngay'}
                    </button>
                </div>

                <div className={styles.calendarSection}>
                    <div className={styles.dateBar}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <button className={styles.navBtn} onClick={() => setCurrentViewDate(prev => addDays(prev, -7))} disabled={isPastWeek}>&lt;</button>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span style={{fontWeight: 'bold'}}>{formatMonthYear(currentViewDate)}</span>
                            <button className={styles.todayBtn} onClick={() => { setCurrentViewDate(new Date()); setSelectedDate(new Date()); }}>Hôm nay</button>
                        </div>
                        <button className={styles.navBtn} onClick={() => setCurrentViewDate(prev => addDays(prev, 7))}>&gt;</button>
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'space-around', padding: '10px', borderBottom: '1px solid #eee'}}>
                        {weekDays.map((date, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedDate(date)}
                                style={{
                                    textAlign: 'center', cursor: 'pointer', padding: '5px 10px', borderRadius: '8px',
                                    backgroundColor: isSameDay(date, selectedDate) ? '#4f46e5' : 'transparent',
                                    color: isSameDay(date, selectedDate) ? 'white' : 'inherit'
                                }}
                            >
                                <div style={{fontSize: '12px'}}>{getDayNameVN(date)}</div>
                                <div style={{fontWeight: 'bold'}}>{date.getDate()}</div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.calendarContainer}>
                        <table className={styles.calendarTable}>
                            <tbody>{renderCalendarRows()}</tbody>
                        </table>
                    </div>

                    <div className={styles.legend}>
                        <div><span className={styles.dot} style={{background: '#ef4444'}}></span>Đã có người đặt</div>
                        <div><span className={styles.dot} style={{background: '#eab308'}}></span>Đang giữ chỗ</div>
                        <div><span className={styles.dot} style={{background: '#fff', border: '1px solid #ddd'}}></span>Trống</div>
                    </div>
                </div>
            </div>

            {/* SỬA: DÙNG MODAL MỚI BookingModalForUser */}
            <BookingModalForUser 
                isOpen={isBookingModalOpen} 
                onClose={() => setIsBookingModalOpen(false)} 
                court={selectedCourt}
                defaultDate={selectedDate}
                onSuccess={loadBookings}
            />
        </div>
    );
};

export default CenterDetailPage;