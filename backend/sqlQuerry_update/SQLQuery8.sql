CREATE TABLE Transactions (
    transaction_id INT IDENTITY(1,1) PRIMARY KEY,
    booking_id INT NOT NULL, 
    

    amount MONEY NOT NULL,
    

    payment_method NVARCHAR(50) DEFAULT 'VNPAY',
    

    transaction_ref NVARCHAR(100), 
    
  
    status NVARCHAR(50) DEFAULT 'Pending',
    
    
    description NVARCHAR(255),
    
    created_at DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id)
);
GO