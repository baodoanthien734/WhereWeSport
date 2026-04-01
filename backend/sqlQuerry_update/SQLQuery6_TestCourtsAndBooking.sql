DECLARE @OwnerId INT = (SELECT user_id FROM Users WHERE email = 'cupoftea0703@gmail.com'); 
DECLARE @CenterId INT = (SELECT center_id FROM SportsCenters WHERE center_owner_id = @OwnerId);

INSERT INTO Courts (center_id, court_name, court_type, price_per_hour, status, created_at, updated_at)
VALUES 
(@CenterId, N'Sân A - VIP', N'Cầu lông', 50000, 'Active', GETDATE(), GETDATE()),
(@CenterId, N'Sân B - Thường', N'Cầu lông', 40000, 'Maintenance', GETDATE(), GETDATE());

SELECT * FROM Courts WHERE center_id = 1;

DECLARE @CourtID INT = 1;

INSERT INTO Bookings (court_id, user_id, start_time, end_time, total_price, status, created_at, updated_at)
VALUES 
(1, 1008, '2025-11-12 07:00:00', '2025-11-12 09:00:00', 100000, 'Confirmed', GETDATE(), GETDATE());


INSERT INTO Bookings (court_id, booked_by_owner, customer_name_offline, start_time, end_time, total_price, status, created_at, updated_at)
VALUES 
(1, 1, N'Khách Vãng Lai A', '2025-11-12 14:00:00', '2025-11-12 15:30:00', 75000, 'Confirmed', GETDATE(), GETDATE());

SELECT * FROM Bookings;
