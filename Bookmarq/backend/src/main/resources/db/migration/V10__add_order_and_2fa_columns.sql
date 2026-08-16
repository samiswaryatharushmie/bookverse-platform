-- Add new columns for order payment features
ALTER TABLE orders ADD payment_method NVARCHAR(20);
ALTER TABLE orders ADD payment_receipt_url NVARCHAR(500);

-- Add new columns for two-factor authentication
ALTER TABLE users ADD is_two_factor_enabled BIT NOT NULL CONSTRAINT DF_users_is_two_factor_enabled DEFAULT 0;
ALTER TABLE users ADD two_factor_code NVARCHAR(10);
ALTER TABLE users ADD two_factor_expiry DATETIME2;
