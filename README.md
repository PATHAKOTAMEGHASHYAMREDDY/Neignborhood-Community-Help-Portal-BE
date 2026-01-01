# Community Help Portal - Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Database Setup

Create MySQL database and import schema:
```bash
mysql -u root -p
CREATE DATABASE community_help_portal;
exit;

mysql -u root -p community_help_portal < database.sql
```

**Or copy and run this SQL directly:**

```sql
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
    role ENUM('Resident', 'Helper', 'Admin') NOT NULL,
    profile_image VARCHAR(500) NULL,
    is_blocked BOOLEAN DEFAULT FALSE,
    reset_otp VARCHAR(6) NULL,
    reset_otp_expires BIGINT NULL,
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

-- User Reports Table
CREATE TABLE IF NOT EXISTS user_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    reported_user_id INT NOT NULL,
    request_id INT NULL,
    issue_type ENUM('Inappropriate Behavior', 'Harassment', 'Spam', 'Fraud', 'Other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'Under Review', 'Resolved', 'Dismissed') DEFAULT 'Pending',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES help_requests(id) ON DELETE SET NULL,
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_reported_user_id (reported_user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### 3. Configure Environment

Create or update `.env` file in the Backend directory with these variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=community_help_portal

# JWT Configuration
JWT_SECRET=community_help_portal_secret_key_2025_secure_token
JWT_EXPIRES_IN=7d

# Email Configuration (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password

# Frontend Configuration
FRONTEND_URL=http://localhost:4200
```

**Important Notes:**
- Replace `DB_PASSWORD` with your MySQL root password
- For Gmail, generate an App Password:
  1. Enable 2-Factor Authentication on your Google account
  2. Go to Google Account Settings > Security > App Passwords
  3. Generate a new app password for "Mail"
  4. Use this password in `EMAIL_APP_PASSWORD`

### 4. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Server runs on: `http://localhost:3000`

## Admin Login Credentials

```
Email: admin@portal.com
Password: Admin@123
```

**Note:** Admin account is hardcoded in the backend and does not exist in the database.
