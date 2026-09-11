-- ============================================================
-- Store Rating System — MySQL Database Schema & Seed Script
-- Database: store_rating_db
-- ============================================================

-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS store_rating_db;
USE store_rating_db;

-- Drop tables if they exist (in reverse foreign key order)
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- ------------------------------------------------------------
-- 1. Users Table
-- Roles: 'ADMIN', 'USER', 'STORE_OWNER'
-- ------------------------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400) DEFAULT NULL,
  role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Stores Table
-- ------------------------------------------------------------
CREATE TABLE stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  address VARCHAR(400) DEFAULT NULL,
  owner_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_stores_owner
    FOREIGN KEY (owner_id) 
    REFERENCES users(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
    
  INDEX idx_stores_name (name),
  INDEX idx_stores_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Ratings Table
-- ------------------------------------------------------------
CREATE TABLE ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  store_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Prevent a user from rating the same store multiple times
  CONSTRAINT uq_user_store UNIQUE (user_id, store_id),
  
  CONSTRAINT fk_ratings_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_ratings_store
    FOREIGN KEY (store_id) 
    REFERENCES stores(id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
    
  INDEX idx_ratings_user_id (user_id),
  INDEX idx_ratings_store_id (store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- Default Password for all seed users: Password123!
-- Bcrypt Hash: $2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem
-- ============================================================

-- 1 Admin
INSERT INTO users (id, name, email, password, address, role) VALUES
(1, 'System Administrator', 'admin@storerating.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '100 Admin HQ Blvd, Suite 500, New York, NY 10001', 'ADMIN');

-- 2 Store Owners
INSERT INTO users (id, name, email, password, address, role) VALUES
(2, 'Carlos Rodriguez', 'carlos@apextech.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '124 Tech Blvd, Austin, TX 78701', 'STORE_OWNER'),
(3, 'Elena Rostova', 'elena@urbanroast.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '45 Market Sq, Seattle, WA 98101', 'STORE_OWNER');

-- 5 Normal Users
INSERT INTO users (id, name, email, password, address, role) VALUES
(4, 'Alice Smith', 'alice@example.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '12 Maple St, Boston, MA 02108', 'USER'),
(5, 'Bob Jones', 'bob@example.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '456 Oak Ave, Chicago, IL 60601', 'USER'),
(6, 'Charlie Brown', 'charlie@example.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '789 Pine Rd, San Francisco, CA 94102', 'USER'),
(7, 'Diana Prince', 'diana@example.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '321 Elm St, Denver, CO 80202', 'USER'),
(8, 'Evan Wright', 'evan@example.com', '$2b$10$71ZsJ6EYZJOHBih0gmj9COx9/kBDYTVEKcTdi/3g5rBsJmev7wsem', '654 Birch Way, Miami, FL 33101', 'USER');

-- 5 Stores
INSERT INTO stores (id, name, email, address, owner_id) VALUES
(1, 'Apex Electronics', 'support@apextech.com', '124 Tech Blvd, Austin, TX 78701', 2),
(2, 'Apex Mobile Care', 'care@apextech.com', '500 Innovation Way, Austin, TX 78702', 2),
(3, 'Urban Roast Cafe', 'contact@urbanroast.com', '45 Market Sq, Seattle, WA 98101', 3),
(4, 'Urban Bakery & Deli', 'info@urbanroast.com', '48 Market Sq, Seattle, WA 98101', 3),
(5, 'Lumina Home Decor', 'sales@luminadecor.com', '789 Design Way, San Jose, CA 95110', NULL);

-- Sample Ratings
INSERT INTO ratings (user_id, store_id, rating) VALUES
(4, 1, 5), -- Alice rated Apex Electronics 5
(4, 3, 4), -- Alice rated Urban Roast Cafe 4
(5, 1, 4), -- Bob rated Apex Electronics 4
(5, 2, 5), -- Bob rated Apex Mobile Care 5
(5, 3, 5), -- Bob rated Urban Roast Cafe 5
(6, 3, 3), -- Charlie rated Urban Roast Cafe 3
(6, 4, 4), -- Charlie rated Urban Bakery & Deli 4
(7, 1, 5), -- Diana rated Apex Electronics 5
(7, 5, 4), -- Diana rated Lumina Home Decor 4
(8, 2, 4), -- Evan rated Apex Mobile Care 4
(8, 5, 3); -- Evan rated Lumina Home Decor 3
