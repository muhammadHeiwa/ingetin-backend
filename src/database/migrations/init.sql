-- Database
CREATE DATABASE IF NOT EXISTS ingetin_db;
USE ingetin_db;

-- Table: users
CREATE TABLE tb_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: todos
CREATE TABLE tb_todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_time DATETIME,
    reminder_deadline DATETIME,
    status ENUM('active', 'disabled') DEFAULT 'disabled',
    is_reminded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tb_users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_reminder_time (reminder_time),
    INDEX idx_deadline (reminder_deadline)
);

-- Table: tb_todo_history
CREATE TABLE tb_todo_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    todo_id INT NOT NULL,
    user_id INT NOT NULL,
    action_type ENUM('success', 'failed', 'reminder_sent') NOT NULL,
    action_time DATETIME NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (todo_id) REFERENCES tb_todos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tb_users(id) ON DELETE CASCADE,
    INDEX idx_user_action (user_id, action_type)
);

-- Table: user_statistics
CREATE TABLE tb_user_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    success_times INT DEFAULT 0,
    failed_times INT DEFAULT 0,
    error_times INT DEFAULT 0,
    total_todos INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES tb_users(id) ON DELETE CASCADE
);