const axios = require('axios').default;
const crypto = require('crypto');
const moment = require('moment');
const { sql } = require('../config/db');

// Kiểm tra xem biến môi trường có load được không
if (!process.env.ZALO_APP_ID) {
    console.error("❌ LỖI: Không tìm thấy biến môi trường ZALO_APP_ID. Kiểm tra file .env hoặc dotenv config.");
}

const config = {
    app_id: process.env.ZALO_APP_ID,
    // .trim() để tránh lỗi copy paste có dấu cách
    key1: process.env.ZALO_KEY1.trim(), 
    key2: process.env.ZALO_KEY2.trim(),
    endpoint: process.env.ZALO_ENDPOINT.trim()
};

const createZaloPaymentUrl = async (req, res) => {
    try {
        console.log("--- BẮT ĐẦU TẠO ĐƠN ZALOPAY ---");
        
        // 1. Lấy và ép kiểu dữ liệu đầu vào
        const amount = Number(req.body.amount); 
        const bookingId = String(req.body.bookingId);

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: "Số tiền không hợp lệ" });
        }

        // 2. Transaction DB 
        const insertTransaction = await sql.query`
            INSERT INTO Transactions 
            (booking_id, amount, payment_method, status, description, created_at)
            OUTPUT inserted.transaction_id
            VALUES 
            (${bookingId}, ${amount}, 'ZALOPAY', 'Pending', N'Thanh toán qua ZaloPay', GETDATE())
        `;
        const transactionId = insertTransaction.recordset[0].transaction_id;

        // 3. Chuẩn bị dữ liệu ZaloPay
        const transID = `${moment().format('YYMMDD')}_${transactionId}`;
        
        const embed_data = {
            redirecturl: `http://localhost:3000/payment-success?orderId=${transactionId}`
        };

        const items = [{
            itemid: bookingId,
            itemname: "Dat san cau long",
            itemprice: amount,
            itemquantity: 1
        }];

        const app_id_int = parseInt(config.app_id);
        
        // Tạo object order
        const order = {
            app_id: app_id_int,
            app_user: "user123",
            app_time: Date.now(), 
            amount: amount,      
            app_trans_id: transID,
            bank_code: "",
            item: JSON.stringify(items),
            description: `Thanh toan don hang #${transID}`,
            embed_data: JSON.stringify(embed_data)
        };

        // 4. Tính MAC (Chữ ký)
        // Công thức: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        
        order.mac = crypto.createHmac('sha256', config.key1)
            .update(data)
            .digest('hex');

        console.log("Data String để tạo MAC:", data);
        console.log("MAC đã tạo:", order.mac);
        console.log("Order gửi đi:", order);

        // 5. Gửi Request
        const response = await axios.post(config.endpoint, order, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Kết quả từ ZaloPay:", response.data);

        if (response.data.return_code === 1) {
             await sql.query`
                UPDATE Transactions 
                SET transaction_ref = ${transID}
                WHERE transaction_id = ${transactionId}
             `;
             res.status(200).json({ paymentUrl: response.data.order_url });
        } else {

             res.status(400).json({ 
                 message: "Tạo đơn ZaloPay thất bại", 
                 detail: response.data,
                 debug_mac_input: data 
             });
        }

    } catch (err) {
        console.error('Lỗi Exception ZaloPay:', err);
        res.status(500).json({ message: 'Lỗi server ZaloPay', error: err.message });
    }
};

const zaloCallback = async (req, res) => {
    let result = {};
    try {
        const { data: dataStr, mac: reqMac } = req.body;
        const mac = crypto.createHmac('sha256', config.key2).update(dataStr).digest('hex');

        if (reqMac !== mac) {
            result.return_code = -1;
            result.return_message = "mac not equal";
        } else {
            const dataJson = JSON.parse(dataStr);
            const appTransId = dataJson['app_trans_id']; 
            const transactionId = appTransId.split('_')[1];

            await sql.query`
                UPDATE Transactions 
                SET status = 'Success', description = N'ZaloPay Success'
                WHERE transaction_id = ${transactionId}
            `;

            
            result.return_code = 1;
            result.return_message = "success";
        }
    } catch (ex) {
        result.return_code = 0;
        result.return_message = ex.message;
    }
    res.json(result);
};

module.exports = {
    createZaloPaymentUrl,
    zaloCallback
};