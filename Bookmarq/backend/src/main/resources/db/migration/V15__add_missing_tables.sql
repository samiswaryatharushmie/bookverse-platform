-- V15__add_missing_tables.sql

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'is_email_verified' AND Object_ID = Object_ID(N'users'))
BEGIN
    ALTER TABLE users ADD is_email_verified BIT NOT NULL CONSTRAINT DF_users_is_email_verified DEFAULT 0;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'email_verification_code' AND Object_ID = Object_ID(N'users'))
BEGIN
    ALTER TABLE users ADD email_verification_code NVARCHAR(10);
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE Name = N'email_verification_expiry' AND Object_ID = Object_ID(N'users'))
BEGIN
    ALTER TABLE users ADD email_verification_expiry DATETIME2;
END
GO

-- Set existing users to verified so they can log in
UPDATE users SET is_email_verified = 1 WHERE is_email_verified = 0;
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='notifications' and xtype='U')
BEGIN
    CREATE TABLE notifications (
        id UNIQUEIDENTIFIER PRIMARY KEY,
        user_id UNIQUEIDENTIFIER,
        type NVARCHAR(50) NOT NULL,
        title NVARCHAR(150) NOT NULL,
        message NVARCHAR(MAX) NOT NULL,
        is_read BIT NOT NULL CONSTRAINT DF_notifications_is_read DEFAULT 0,
        action_link NVARCHAR(255),
        created_at DATETIME2 NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='promotions' and xtype='U')
BEGIN
    CREATE TABLE promotions (
        code NVARCHAR(50) PRIMARY KEY,
        discount_percentage DECIMAL(5,2) NOT NULL,
        active BIT NOT NULL CONSTRAINT DF_promotions_active DEFAULT 1,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        usage_count INT NOT NULL CONSTRAINT DF_promotions_usage_count DEFAULT 0,
        max_usage INT NOT NULL CONSTRAINT DF_promotions_max_usage DEFAULT 100,
        banner_text NVARCHAR(255),
        banner_active BIT NOT NULL CONSTRAINT DF_promotions_banner_active DEFAULT 0
    );
END
GO
