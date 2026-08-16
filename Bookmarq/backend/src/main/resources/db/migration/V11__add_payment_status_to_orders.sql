-- Add missing payment_status column to orders table
ALTER TABLE orders ADD payment_status NVARCHAR(20) NOT NULL CONSTRAINT DF_orders_payment_status DEFAULT 'PENDING';
