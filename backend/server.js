require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const cron = require('node-cron');
const bookingModel = require('./models/bookingModel');


const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes'); 
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const centerRoutes = require('./routes/centerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const zaloPaymentRoutes = require('./routes/zaloPaymentRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); 
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/zalopay', zaloPaymentRoutes);


cron.schedule('* * * * *', async () => {
    try {
        const cancelledList = await bookingModel.scanAndCancelExpiredBookings();
        
        if (cancelledList && cancelledList.length > 0) {
            console.log(`🔥 [Auto-Cancel] Hệ thống đã tự động hủy ${cancelledList.length} đơn hàng hết hạn thanh toán (15 phút).`);
            console.log('Chi tiết đơn hủy:', cancelledList.map(b => b.booking_id));
        }
    } catch (err) {
        console.error('❌ [Cron Job Error]:', err.message);
    }
});
// ------------------------------------------------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));