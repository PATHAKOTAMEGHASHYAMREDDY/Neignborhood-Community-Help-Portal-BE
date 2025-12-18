-- Create Database
CREATE DATABASE IF NOT EXISTS community_help_portal;
USE community_help_portal;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Resident', 'Helper') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_contact_info (contact_info),
    INDEX idx_role (role)
);

-- Help Requests Table
CREATE TABLE IF NOT EXISTS help_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT NOT NULL,
    helper_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status ENUM('Pending', 'Accepted', 'In-progress', 'Completed') DEFAULT 'Pending',
    attachments VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (helper_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_resident_id (resident_id),
    INDEX idx_helper_id (helper_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role ENUM('Resident', 'Helper') NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES help_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_request_id (request_id),
    INDEX idx_sender_id (sender_id),
    INDEX idx_created_at (created_at)
);

-- Sample Data (Optional - for testing)
-- INSERT INTO users (name, contact_info, location, password, role) VALUES
-- ('John Doe', 'john@example.com', '123 Main St', '$2b$10$hashedpassword', 'Resident'),
-- ('Jane Smith', 'jane@example.com', '456 Oak Ave', '$2b$10$hashedpassword', 'Helper');

--Admin side

ALTER TABLE users 
MODIFY role ENUM('Resident', 'Helper', 'Admin');

INSERT INTO users (name, contact_info, location, role, password)
VALUES ('Admin', 'admin@portal.com', 'System', 'Admin', 'admin123');
