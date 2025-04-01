CREATE DATABASE if not exists architecture;
    USE architecture;

drop table ride_tracking;
drop table admin_logs;
drop table payments;
drop table feedback;
drop table rides;
drop table drivers;
drop table users;

-- User Management
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('Customer', 'Driver', 'Admin') NOT NULL,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver Details
CREATE TABLE drivers (
    id INT PRIMARY KEY,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('Available', 'On Ride', 'Offline') DEFAULT 'Offline',
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ride Booking System
CREATE TABLE rides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    driver_id INT,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Accepted', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Pending',
    rating ENUM('Bad', 'Neutral', 'Good') DEFAULT 'Neutral',
    fare DECIMAL(10,2),
    start_time DATETIME,
    end_time DATETIME,
    vehicle VARCHAR(255),
    passengers INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

-- Payments & Fare Management
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ride_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    payment_method ENUM('Credit Card', 'Debit Card', 'Wallet', 'Cash') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Feedback & Support
CREATE TABLE feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    find_us VARCHAR(100),
    rating INT NOT NULL,
    feedback_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

 -- Real-Time Tracking
 CREATE TABLE ride_tracking (
     ride_id INT PRIMARY KEY,
     latitude DECIMAL(9,6),
     longitude DECIMAL(9,6),
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
 );
 
 CREATE TABLE admin_logs (
     id INT AUTO_INCREMENT PRIMARY KEY,
     admin_id INT NOT NULL,
     action VARCHAR(255) NOT NULL,
     details TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
 );

INSERT INTO users (name, email, password_hash, user_type, profile_picture)
VALUES ('Admin User', 'admin@example.com', '$2a$12$6P2ha0IYH3IrMTSj2s2e/OSp9YPoje4MWzfq4C6o78OYZ1uN76Kq2', 'Admin', 'path/to/profile_picture.jpg');
INSERT INTO users (name, email, password_hash, user_type)
VALUES ('Test User 1743493732', 'testuser1743493732@example.com', 'hashedPassword123', 'Customer');


select * from users;
select * from rides;
SELECT * FROM payments WHERE customer_id = 1

