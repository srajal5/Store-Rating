# Database Setup Guide — MySQL

This directory contains the SQL script for creating the `store_rating_db` database, creating required tables (`users`, `stores`, `ratings`), enforcing foreign key constraints, indexes, and populating initial seed data.

## Prerequisites

- **MySQL Server** (v8.0+) installed and running locally or on a remote host.
- MySQL CLI tool or a GUI client (e.g., MySQL Workbench, phpMyAdmin, DBeaver).

---

## Database Creation & Execution Instructions

### Method 1: Using MySQL Command Line (CLI)

1. Open your terminal or PowerShell.
2. Connect to MySQL with your admin user (e.g., `root`):
   ```bash
   mysql -u root -p
   ```
3. Enter your MySQL root password when prompted.
4. Execute `schema.sql` directly:
   ```sql
   SOURCE d:/Assessment/store-rating-system/database/schema.sql;
   ```
   *Or from your shell command line:*
   ```bash
   mysql -u root -p < database/schema.sql
   ```

---

### Method 2: Using MySQL Workbench / GUI

1. Open MySQL Workbench and connect to your local MySQL instance.
2. Go to **File -> Open SQL Script...** and select `database/schema.sql`.
3. Click the **Execute (Lightning Bolt ⚡)** button to run the entire script.

---

## Database Verification Queries

After executing `schema.sql`, verify the tables and seed data:

```sql
USE store_rating_db;

-- 1. Verify Users
SELECT id, name, email, role FROM users;

-- 2. Verify Stores with Owner Names
SELECT s.id, s.name AS store_name, s.email, u.name AS owner_name 
FROM stores s 
LEFT JOIN users u ON s.owner_id = u.id;

-- 3. Verify Ratings with User & Store Details
SELECT r.id, u.name AS user_name, s.name AS store_name, r.rating 
FROM ratings r
JOIN users u ON r.user_id = u.id
JOIN stores s ON r.store_id = s.id;
```

---

## Initial Seed Account Credentials

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `admin@storerating.com` | `Password123!` |
| **STORE_OWNER** | `carlos@apextech.com` | `Password123!` |
| **STORE_OWNER** | `elena@urbanroast.com` | `Password123!` |
| **USER** | `alice@example.com` | `Password123!` |
| **USER** | `bob@example.com` | `Password123!` |
| **USER** | `charlie@example.com` | `Password123!` |
| **USER** | `diana@example.com` | `Password123!` |
| **USER** | `evan@example.com` | `Password123!` |
