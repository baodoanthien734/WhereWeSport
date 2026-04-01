import api from './api';

export const createPaymentUrl = async (paymentData) => {
    try {
        // paymentData bao gồm: { bookingId, amount, bankCode, language }
        const response = await api.post('/payment/create_payment_url', paymentData);
        
        return response.data; 
    } catch (error) {
        throw error.response?.data || { msg: 'Lỗi khi tạo giao dịch thanh toán' };
    }
};

export const createZaloPayUrl = async (paymentData) => {
    try {
        const response = await api.post('/zalopay/create_payment_url', paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { msg: 'Lỗi khi tạo giao dịch ZaloPay' };
    }
};

const paymentService = {
    createPaymentUrl,
    createZaloPayUrl
};

export default paymentService;