# WhereWeSport - Sports Facility Booking Platform

A full-stack web application for booking sports facilities (courts, fields) with integrated payment solutions. Built with React, Node.js, Express, and MSSQL.

## 📋 Features

### For Users
- **Browse & Search** - View available sports centers and their courts
- **Court Booking** - Book courts for specific time slots
- **Real-time Availability** - See available time slots based on existing bookings
- **Payment Integration** - Integrated with VNPAY and ZaloPay
- **Booking Management** - View booking history and cancel bookings
- **User Profile** - Manage personal information

### For Court Owners
- **Center Management** - Create and manage sports centers
- **Court Management** - Add, edit, and deactivate courts
- **Booking Requests** - Receive, approve, or reject booking requests
- **Owner Dashboard** - Overview of center performance and bookings
- **Offline Booking** - Book courts directly for walk-in customers

### For Admins
- **User Management** - Manage user accounts and permissions
- **Center Approval** - Approve new center registration requests
- **System Overview** - Administrative dashboard

### System Features
- **Auto-cancel Expired Bookings** - Automatically cancels unpaid bookings after 15 minutes
- **Email Notifications** - OTP verification and booking confirmations
- **Role-based Access Control** - Secure JWT authentication with role management
- **Multi-payment Support** - VNPAY and ZaloPay integration

## 🛠 Tech Stack

### Frontend
- **React 19.2.0** - UI library
- **React Router 7.9.4** - Client-side routing
- **Zustand 5.0.8** - State management
- **Axios 1.12.2** - HTTP client
- **JWT Decode 4.0.0** - Token parsing

### Backend
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **MSSQL (mssql 12.0.0)** - Database
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **Bcrypt 6.0.0** - Password hashing
- **node-cron 4.2.1** - Scheduled tasks
- **nodemailer 7.0.9** - Email service

### Payment Gateways
- **VNPAY** - Vietnamese payment gateway
- **ZaloPay** - Mobile payment integration

## 📦 Prerequisites

Before running this project, ensure you have installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MSSQL Server** (SQL Server Express or higher)
- **Git** (for version control)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd WhereWeSport
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Database Setup

Create a new database in MSSQL Server named `WhereWeSport` and run the database schema scripts (contact the development team for schema files).

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000

# SQL Server Configuration
DB_USER=sa
DB_PASSWORD=your_password
DB_SERVER=your_server_name
DB_DATABASE=WhereWeSport
DB_PORT=1433

# JWT Configuration
JWT_SECRET=your_super_secret_key
JWT_EXPIRES=2h

# Email Configuration (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_specific_password

# VNPAY Configuration
VNP_TMN_CODE=your_merchant_code
VNP_HASH_SECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNP_RETURN_URL=your_return_url

# ZaloPay Sandbox Configuration
ZALO_APP_ID=554
ZALO_KEY1=your_key1
ZALO_KEY2=your_key2
ZALO_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
```

**Note:** For Gmail, you need to:
1. Enable 2-factor authentication
2. Create an "App Password" in Google Account security settings
3. Use the app password (not your regular password) for `MAIL_PASS`

### Frontend Configuration

The frontend connects to the backend by default at `http://localhost:5000`. If your backend runs on a different port or URL, update the API configuration in `frontend/src/services/api.js`.

## 🏃 Running the Project

### Start Backend

```bash
cd backend
npm run dev      # Development mode with nodemon
# OR
npm start        # Production mode
```

Backend will run on `http://localhost:5000`

### Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
WhereWeSport/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── bookingController.js  # Booking logic
│   │   ├── centerController.js   # Center management
│   │   └── paymentController.js  # Payment processing
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT authentication
│   ├── models/
│   │   ├── accountModels.js      # User account model
│   │   ├── bookingModel.js       # Booking model
│   │   ├── centerModel.js        # Center model
│   │   └── ...                   # Other models
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── bookingRoutes.js      # Booking endpoints
│   │   ├── centerRoutes.js       # Center endpoints
│   │   ├── paymentRoutes.js      # Payment endpoints
│   │   └── ...                   # Other routes
│   ├── uploads/                  # Image uploads
│   ├── .env                      # Environment variables
│   ├── package.json
│   └── server.js                 # Main entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── MasterLayout.jsx  # Authenticated layout
│   │   │   ├── GuestLayout.jsx   # Guest layout
│   │   │   ├── BookingModal.jsx  # Booking interface
│   │   │   └── ...               # Other components
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── CenterListPage.jsx
│   │   │   ├── CenterDetailPage.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   └── ...               # Other pages
│   │   ├── services/             # API service layer
│   │   │   ├── api.js            # Axios configuration
│   │   │   ├── authService.js    # Auth API calls
│   │   │   ├── bookingService.js # Booking API calls
│   │   │   └── paymentService.js # Payment API calls
│   │   ├── store/                # State management
│   │   │   ├── authStore.js      # Auth state
│   │   │   └── ownerStore.js     # Owner state
│   │   ├── utils/                # Utility functions
│   │   ├── App.js                # Main app with routing
│   │   └── index.js              # React entry point
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/request-otp` - Request OTP for email verification
- `POST /api/auth/verify-otp` - Verify OTP

### Centers (Public)
- `GET /api/centers` - Get all active centers
- `GET /api/centers/:id` - Get center details
- `GET /api/centers/:id/courts` - Get courts for a center
- `GET /api/centers/bookings?courtId=&date=` - Get public booking schedule

### Bookings
- `POST /api/bookings` - Create new booking (User/Owner)
- `GET /api/bookings/pending` - Get pending bookings (Owner only)
- `POST /api/bookings/:id/approve` - Approve booking (Owner only)
- `POST /api/bookings/:id/reject` - Reject booking (Owner only)
- `POST /api/bookings/:id/pay` - Pay for booking
- `GET /api/bookings/mine` - Get my bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Payment
- `POST /api/payment/create_payment_url` - Create VNPAY payment URL
- `GET /api/payment/vnpay_return` - VNPAY return callback
- `GET /api/payment/vnpay_ipn` - VNPAY IPN callback
- `POST /api/zalopay/create` - Create ZaloPay payment

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/avatar` - Upload avatar

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/centers/pending` - Get pending center requests
- `POST /api/admin/centers/:id/approve` - Approve center

## 👥 User Roles

### Guest
- Browse centers and courts
- View available time slots
- Register and login

### User
- All guest features
- Book courts
- Make payments
- View booking history
- Cancel bookings

### Court Owner
- All user features
- Create and manage centers
- Manage courts
- Approve/reject booking requests
- Create offline bookings
- View owner dashboard

### Admin
- All features
- Manage users
- Approve center registrations
- System administration

## 💳 Payment Integration

### VNPAY
- Integrated with VNPAY sandbox environment
- Redirects user to VNPAY payment page
- Returns to application after payment
- IPN callback for payment confirmation

### ZaloPay
- Integrated with ZaloPay sandbox
- In-app payment flow
- HMAC-SHA256 signature verification

## ⚠️ Security Notes

- **Never commit `.env` files** to version control
- **Use strong JWT secrets** in production
- **Use environment-specific credentials** for production
- **Enable SQL injection protection** (parameterized queries used)
- **Implement rate limiting** for API endpoints in production
- **Use HTTPS** in production
- **Regularly update dependencies** for security patches

## 🐛 Troubleshooting

### Database Connection Issues
- Verify SQL Server is running
- Check connection string in `.env`
- Ensure SQL Server allows remote connections
- Verify firewall settings

### Port Already in Use
- Change the `PORT` in backend `.env`
- Kill process using the port: `npx kill-port 5000`

### Payment Gateway Issues
- Verify API keys and secrets
- Check sandbox vs production URLs
- Ensure return URLs are accessible
- Check payment gateway status

## 📝 Development Notes

- Backend runs on port 5000 by default
- Frontend runs on port 3000 by default
- Auto-cancel cron job runs every minute
- Booking timeout: 15 minutes for payment
- Images stored in `backend/uploads/` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

- Development Team

## 📞 Support

For support and questions, please contact the development team or open an issue in the repository.
