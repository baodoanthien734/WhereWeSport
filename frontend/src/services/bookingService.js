import api from './api';

export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.put(`/bookings/${bookingId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { msg: 'Lỗi khi hủy đơn hàng' };
    }
};

const bookingService = {
    cancelBooking
};

export default bookingService;