import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// Import Named Export
import { useOwnerStore } from '../store/ownerStore.js';
import api from '../services/api.js';
import styles from './OwnerDashboardPage.module.css';
import { getStartOfWeek, addDays, isSameDay, formatMonthYear, getDayNameVN, formatDateForAPI } from '../utils/dateUtils.js';

// Import các Modal
import AddCourtModal from '../components/AddCourtModal.jsx';
import EditCourtModal from '../components/EditCourtModal.jsx';
import BookingModal from '../components/BookingModal.jsx';
import RequestList from '../components/RequestList.jsx';

const OwnerDashboardPage = () => {
    // Lấy state từ store
    const center = useOwnerStore((state) => state.center);
    const courts = useOwnerStore((state) => state.courts);
    const setCourts = useOwnerStore((state) => state.setCourts);
    
    const [activeTab, setActiveTab] = useState('calendar');
    const [selectedCourtId, setSelectedCourtId] = useState(null);

    // State ngày tháng
    const today = useMemo(() => new Date(), []);
    const [currentViewDate, setCurrentViewDate] = useState(today);
    const [selectedDate, setSelectedDate] = useState(today);

    // State Booking
    const [bookings, setBookings] = useState([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(false);

    // State Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCourt, setEditingCourt] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingModalCourt, setBookingModalCourt] = useState(null);

    const hasFetchedCourts = useRef(false);

    // Logic tính tuần
    const weekDays = useMemo(() => {
        const startOfWeek = getStartOfWeek(currentViewDate);
        return Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
    }, [currentViewDate]);

    const handlePrevWeek = () => setCurrentViewDate(prev => addDays(prev, -7));
    const handleNextWeek = () => setCurrentViewDate(prev => addDays(prev, 7));
    const handleToday = () => {
        const now = new Date();
        setCurrentViewDate(now);
        setSelectedDate(now);
    };

    // 1. Lấy danh sách sân
    useEffect(() => {
        if (hasFetchedCourts.current) return;

        const fetchCourts = async () => {
            try {
                const response = await api.get('/owner/courts');
                if (response.status === 200) {
                    setCourts(response.data);
                    
                    setSelectedCourtId(prev => {
                        if (!prev && response.data.length > 0) {
                            return response.data[0].court_id;
                        }
                        return prev;
                    });
                    hasFetchedCourts.current = true;
                }
            } catch (error) {
                console.error("Lỗi lấy danh sách sân:", error);
            }
        };
        fetchCourts();
    }, [setCourts]);

    const loadBookings = useCallback(async () => {
        if (!selectedCourtId) return;
        
        setIsLoadingBookings(true);
        try {
            const dateStr = formatDateForAPI(selectedDate);
            const response = await api.get(`/owner/bookings?courtId=${selectedCourtId}&date=${dateStr}`);
            
            if (response.status === 200) {
                setBookings(response.data);
            }
        } catch (error) {
            console.error("Lỗi lấy lịch đặt sân:", error);
            setBookings([]); 
        } finally {
            setIsLoadingBookings(false);
        }
    }, [selectedCourtId, selectedDate]);

 
    useEffect(() => {
        loadBookings();
    }, [loadBookings]); 

    // Các hàm helper
    const selectedCourt = courts.find(c => c.court_id === selectedCourtId);

    const handleEditClick = (e, court) => {
        e.stopPropagation();
        setEditingCourt(court);
        setIsEditModalOpen(true);
    };

    const handleQuickBookClick = (e, court) => {
        e.stopPropagation();
        setBookingModalCourt(court);
        setIsBookingModalOpen(true);
    };

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
            const durationDisplay = durationRaw % 1 === 0 ? durationRaw + 'h' : durationRaw.toFixed(1) + 'h';

            const startTimeStr = `${startHour}:${startMin.toString().padStart(2, '0')}`;
            const endTimeStr = `${endHour}:${endMin.toString().padStart(2, '0')}`;
            const displayTime = `${startTimeStr} - ${endTimeStr}`;

            // Chỉ lưu vào map, không dùng rowspan
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
                       <td className={styles.bookingCell}>
                           <div className={getCellClass(booking)}>
                               <p className={styles.bookingTitle}>
                                   {booking.booked_by_owner ? booking.customer_name_offline : booking.username}
                               </p>
                               <p className={styles.bookingTime}>
                                   {booking.displayTime} ({booking.durationText})
                               </p>
                               {booking.status === 'Pending' && <span className={styles.badgePending}>Chờ duyệt</span>}
                           </div>
                       </td>
                   ) : (
                       <td className={styles.emptyCell} 
                            onClick={() => {
                                // Click vào ô trống -> Đặt cho sân đang xem
                                setBookingModalCourt(selectedCourt);
                                setIsBookingModalOpen(true);
                            }}
                       ></td>
                   )}
               </tr>
            );
        });
    };

    const getCellClass = (booking) => {
        if (booking.status === 'Pending') return `${styles.bookingBlock} ${styles.blockYellow}`;
        if (booking.status === 'Approved_Unpaid') return `${styles.bookingBlock} ${styles.blockUnpaid}`;
        if (booking.booked_by_owner) return `${styles.bookingBlock} ${styles.blockBlue}`;
        return `${styles.bookingBlock} ${styles.blockGreen}`;
    };

    // ... (Phần renderContent giữ nguyên) ...
    const renderContent = () => {
        switch (activeTab) {
            case 'calendar':
                return (
                    <div style={{ height: '160vh', display: 'flex', flexDirection: 'column' }}>
                        <div className={styles.dateSelectorBar}>
                            <button onClick={handlePrevWeek} className={styles.navArrow}>&lt;</button>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <span className={styles.monthTitle}>{formatMonthYear(currentViewDate)}</span>
                                    <button onClick={handleToday} className={styles.todayBtn}>Hôm nay</button>
                                </div>
                                <div className={styles.weekGrid}>
                                    {weekDays.map((date, index) => {
                                        const isSelected = isSameDay(date, selectedDate);
                                        const isToday = isSameDay(date, today);
                                        return (
                                            <div 
                                                key={index} 
                                                onClick={() => setSelectedDate(date)}
                                                className={`${styles.dayItem} ${isSelected ? styles.daySelected : ''} ${isToday ? styles.dayToday : ''}`}
                                            >
                                                <div className={styles.dayName}>{getDayNameVN(date)}</div>
                                                <div className={styles.dayNumber}>{date.getDate()}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <button onClick={handleNextWeek} className={styles.navArrow}>&gt;</button>
                        </div>

                        <div className={styles.calendarContainer}>
                            <table className={styles.calendarTable}>
                                <thead className={styles.calendarHead}>
                                    <tr>
                                        <th style={{width: '60px'}}>Giờ</th>
                                        <th>
                                            {selectedCourt ? selectedCourt.court_name : 'Lịch đặt sân'} 
                                            {isLoadingBookings && <span style={{fontWeight: 'normal', fontSize: '12px', marginLeft: '10px'}}>(Đang tải...)</span>}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={styles.calendarBody}>
                                    {renderCalendarRows()}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className={styles.legendBar}>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.bgGreen}`}></span>Đã thanh toán</div>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.bgYellow}`}></span>Chờ thanh toán</div>
                            <div className={styles.legendItem}><span className={`${styles.dot} ${styles.bgBlue}`}></span>Chủ sân đặt</div>
                        </div>
                    </div>
                );
            case 'requests': 
                // SỬA: Render component RequestList
                return <RequestList />;

            case 'stats': return <div className="text-center p-10">Thống kê (Đang xây dựng)</div>;
            case 'settings': return <div className="text-center p-10">Cài đặt (Đang xây dựng)</div>;
            default: return null;
        }
    };

    return (
        <div className={styles.container}>
            {/* ... Header, Tabs ... */}
            <div className={styles.header}>
                <h1 className={styles.title}>Quản Lý {center?.center_name || 'Trung Tâm'}</h1>
                <p className={styles.subtitle}>{center?.address_text} - {center?.contact_phone}</p>
            </div>

            <div className={styles.tabsContainer}>
                <button className={`${styles.tabItem} ${activeTab === 'calendar' ? styles.activeTab : ''}`} onClick={() => setActiveTab('calendar')}>Lịch Đặt Sân</button>
                <button className={`${styles.tabItem} ${activeTab === 'requests' ? styles.activeTab : ''}`} onClick={() => setActiveTab('requests')}>Yêu Cầu Chờ</button>
                <button className={`${styles.tabItem} ${activeTab === 'stats' ? styles.activeTab : ''}`} onClick={() => setActiveTab('stats')}>Thống Kê</button>
                <button className={`${styles.tabItem} ${activeTab === 'settings' ? styles.activeTab : ''}`} onClick={() => setActiveTab('settings')}>Cài Đặt Trung Tâm</button>
            </div>

            <div className={styles.dashboardLayout}>
                {activeTab === 'calendar' && (
                    <div className={styles.sidebar}>
                        <h2 className={styles.sidebarTitle}>Các Sân Của Bạn</h2>
                        <div className={styles.courtList}>
                            {courts.map((court) => (
                                <div 
                                    key={court.court_id}
                                    className={`${styles.courtCard} ${selectedCourtId === court.court_id ? styles.courtCardActive : ''}`}
                                    onClick={() => setSelectedCourtId(court.court_id)}
                                >
                                    <div className={styles.courtHeader}>
                                        <span className={selectedCourtId === court.court_id ? styles.courtActiveText : styles.courtName}>{court.court_name}</span>
                                        {court.status === 'Maintenance' ? (
                                            <span style={{fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: '4px'}}>Bảo trì</span>
                                        ) : (
                                            selectedCourtId === court.court_id && <span className={styles.statusBadge}>Đang chọn</span>
                                        )}
                                    </div>
                                    <p className={styles.courtInfo}>{court.court_type} - {Number(court.price_per_hour).toLocaleString()}đ/h</p>
                                    <div className={styles.courtActions}>
                                        <span className={`${styles.actionLink} ${styles.quickBookLink}`} onClick={(e) => handleQuickBookClick(e, court)}>Đặt sân nhanh</span>
                                        <span className={styles.actionLink} onClick={(e) => handleEditClick(e, court)}>Chỉnh sửa</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.sidebarActions}>
                            <button className={styles.addCourtBtn} onClick={() => setIsAddModalOpen(true)}><span>+</span> Thêm Sân Mới</button>
                        </div>
                    </div>
                )}

                <div className={styles.mainContent} style={{padding: 0, overflow: 'hidden'}}>
                    {renderContent()}
                </div>
            </div>

            <AddCourtModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditCourtModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} courtToEdit={editingCourt} />
            
            <BookingModal 
                isOpen={isBookingModalOpen} 
                onClose={() => setIsBookingModalOpen(false)} 
                court={bookingModalCourt}
                defaultDate={selectedDate}
                onSuccess={loadBookings}
            />
        </div>
    );
};

export default OwnerDashboardPage;