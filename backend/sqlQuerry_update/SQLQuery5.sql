-- Script SQL Server cho Bước 1: Tạo 3 bảng cốt lõi
-- Đã bổ sung created_at và updated_at

-- Bảng 1: SportsCenters (Trung tâm thể thao)
CREATE TABLE SportsCenters (
    center_id INT IDENTITY(1,1) PRIMARY KEY,
    center_owner_id INT NOT NULL, -- Khóa ngoại
    center_name NVARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    description NVARCHAR(MAX), -- Tương đương 'text'
    image_url NVARCHAR(1024), -- Tương đương 'nvarchar, nullable'
    is_active BIT DEFAULT 1, -- Tương đương 'boolean'
    
    -- (Cách 3) Thông tin địa chỉ
    address_text NVARCHAR(500),
    latitude FLOAT,
    longitude FLOAT,
    
    -- Bổ sung cột Timestamp
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    -- Tạo liên kết khóa ngoại
    FOREIGN KEY (center_owner_id) REFERENCES Users(user_id)
);
GO

-- Bảng 2: Courts (Các sân con)
CREATE TABLE Courts (
    court_id INT IDENTITY(1,1) PRIMARY KEY,
    center_id INT NOT NULL, -- Khóa ngoại
    court_name NVARCHAR(100) NOT NULL,
    court_type NVARCHAR(100), -- Ví dụ: 'Sân thảm', 'Sân cỏ nhân tạo'
    price_per_hour MONEY NOT NULL,
    status NVARCHAR(50) DEFAULT 'Open', -- 'Open', 'Maintenance'
    
    -- Bổ sung cột Timestamp
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    -- Tạo liên kết khóa ngoại
    FOREIGN KEY (center_id) REFERENCES SportsCenters(center_id) ON DELETE CASCADE -- Nếu xóa trung tâm thì xóa luôn sân
);
GO

-- Bảng 3: Bookings (Lịch đặt sân)
CREATE TABLE Bookings (
    booking_id INT IDENTITY(1,1) PRIMARY KEY,
    court_id INT NOT NULL, -- Khóa ngoại
    user_id INT, -- Khóa ngoại, NULLABLE vì chủ sân có thể đặt
    
    -- Thông tin cho "Đặt sân nhanh" (Bước 7)
    booked_by_owner BIT DEFAULT 0,
    customer_name_offline NVARCHAR(100), -- Tên khách vãng lai

    -- Thông tin lịch
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    total_price MONEY NOT NULL,
    status NVARCHAR(50) NOT NULL, -- 'Pending', 'Confirmed', 'Cancelled'
    
    -- Bổ sung cột Timestamp
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    -- Tạo liên kết khóa ngoại
    FOREIGN KEY (court_id) REFERENCES Courts(court_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
GO

-- (Tùy chọn): Tạo trigger để tự động cập nhật `updated_at`
-- Hoặc bạn có thể xử lý việc này trong logic API (cập nhật `updated_at = GETDATE()` khi `UPDATE`)
-- Ví dụ:
CREATE TRIGGER trg_SportsCenters_Update
ON SportsCenters
AFTER UPDATE
AS
BEGIN
    UPDATE SportsCenters
    SET updated_at = GETDATE()
    WHERE center_id IN (SELECT DISTINCT center_id FROM inserted);
END;
GO