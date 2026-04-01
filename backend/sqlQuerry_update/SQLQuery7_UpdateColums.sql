ALTER TABLE SportsCenters
ADD deposit_percent INT DEFAULT 0;
GO

ALTER TABLE Bookings
ADD paid_amount MONEY DEFAULT 0;
GO

ALTER TABLE Bookings
ADD cancellation_reason NVARCHAR(255);
GO