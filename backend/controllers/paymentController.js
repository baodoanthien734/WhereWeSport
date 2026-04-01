const { sql } = require('../config/db');
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const bookingModel = require('../models/bookingModel');

// Hàm sắp xếp object 
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// === TẠO URL THANH TOÁN ===
async function createPaymentUrl(req, res) {
    try {
        const { bookingId, amount, bankCode, language } = req.body;
        
        // 1. Kiểm tra đơn hàng có tồn tại không
        const booking = await bookingModel.getBookingById(bookingId);
        if (!booking) {
            return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
        }

        // 2. Cấu hình VNPAY
        const tmnCode = process.env.VNP_TMN_CODE;
        const secretKey = process.env.VNP_HASH_SECRET;
        const vnpUrl = process.env.VNP_URL;
        const returnUrl = process.env.VNP_RETURN_URL;

        // 3. Tạo tham số
        let date = new Date();
        let createDate = moment(date).format('YYYYMMDDHHmmss');
        let orderId = bookingId; // Dùng luôn BookingID làm mã đơn hàng VNPAY

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = language || 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang:' + orderId;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100; // VNPAY tính đơn vị là đồng (nhân 100)
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        vnp_Params['vnp_CreateDate'] = createDate;

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // 4. Sắp xếp và tạo chữ ký
        vnp_Params = sortObject(vnp_Params);
        let signData = querystring.stringify(vnp_Params, { encode: false });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;

        // 5. Tạo URL cuối cùng
        let paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

        res.status(200).json({ paymentUrl });

    } catch (err) {
        console.error("Lỗi createPaymentUrl:", err);
        res.status(500).json({ msg: 'Lỗi server khi tạo thanh toán', error: err.message });
    }
}

// === XỬ LÝ IPN (INSTANT PAYMENT NOTIFICATION) ===
async function vnpayIpn(req, res) {
    console.log("🔔 VNPAY IPN Called:", req.query);
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        const orderId = vnp_Params['vnp_TxnRef']; 
        const rspCode = vnp_Params['vnp_ResponseCode'];
        const amount = vnp_Params['vnp_Amount']; 
        const transactionNo = vnp_Params['vnp_TransactionNo']; 

        try {
            // 1. Kiểm tra Booking có tồn tại không
            const booking = await bookingModel.getBookingById(orderId);
            if (!booking) return res.status(200).json({ RspCode: '01', Message: 'Order not found' });

            // 2. Kiểm tra số tiền (Amount của VNPay là int, booking.total_price có thể là float hoặc int)
            // Nhớ chia 100 vì VNPay nhân 100
            const checkAmount = booking.total_price === (parseInt(amount) / 100); 
            if (!checkAmount) return res.status(200).json({ RspCode: '04', Message: 'Amount invalid' });

            // 3. Kiểm tra trạng thái đơn hàng 
            if (booking.status === 'Confirmed') {
                return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
            }

            if (rspCode === '00') {
                // --- A. GIAO DỊCH THÀNH CÔNG ---
                
                // Cập nhật trạng thái Booking
                await bookingModel.updateBookingStatus(orderId, 'Confirmed');

                // Lưu vào bảng Transactions
                await sql.query`
                    INSERT INTO Transactions 
                    (booking_id, amount, payment_method, status, transaction_ref, description, created_at)
                    VALUES 
                    (${orderId}, ${parseInt(amount)/100}, 'VNPAY', 'Success', ${transactionNo}, N'Thanh toán qua VNPAY', GETDATE())
                `;

                console.log(`💰 Thanh toán thành công Booking ${orderId}`);
                res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
            } else {
                // --- B. GIAO DỊCH THẤT BẠI ---
                 await sql.query`
                    INSERT INTO Transactions 
                    (booking_id, amount, payment_method, status, transaction_ref, description, created_at)
                    VALUES 
                    (${orderId}, ${parseInt(amount)/100}, 'VNPAY', 'Failed', ${transactionNo}, N'Thanh toán thất bại mã lỗi ${rspCode}', GETDATE())
                `;
                console.log(`❌ Thanh toán thất bại: ${orderId}`);
                res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
            }
        } catch (error) {
            console.error("Lỗi xử lý IPN:", error);
            res.status(200).json({ RspCode: '99', Message: 'Unknow error' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
    }
}

// XỬ LÝ RETURN URL 
async function vnpayReturn(req, res) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const secretKey = process.env.VNP_HASH_SECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    // Thay bằng URL frontend 
    const frontendUrl = 'http://localhost:3000/payment-result'; 

    if (secureHash === signed) {
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            res.redirect(`${frontendUrl}?status=success&orderId=${vnp_Params['vnp_TxnRef']}`);
        } else {
            res.redirect(`${frontendUrl}?status=failed&orderId=${vnp_Params['vnp_TxnRef']}`);
        }
    } else {
        res.redirect(`${frontendUrl}?status=error&msg=checksum_failed`);
    }
}

module.exports = {
    createPaymentUrl,
    vnpayIpn,
    vnpayReturn
};