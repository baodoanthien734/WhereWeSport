export const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); 

    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
};

// Hàm cộng/trừ ngày
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
};

export const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatMonthYear = (date) => {
    return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
};

export const getDayNameVN = (date) => {
    const days = ['CN', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];
    return days[date.getDay()];
};

export const generateTimeSlots = () => {
    const slots = [];
    for (let i = 5; i < 24; i++) { 
        const hour = String(i).padStart(2, '0');
        slots.push(`${hour}:00`);
        slots.push(`${hour}:30`);
    }
    return slots;
};