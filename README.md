# Discount Voucher Management System

Aplikasi full-stack untuk manajemen voucher diskon menggunakan **Next.js (frontend)** dan **Golang + Gin (backend)** dengan **Clean Architecture by Uncle Bob**. Database menggunakan **MySQL** (direkomendasikan dijalankan via Docker Compose).

## Fitur

- Dummy login (POST /login → token `123456`)
- CRUD voucher
- Search, sorting, pagination
- Upload CSV
- Export CSV

## Tech Stack

- Next.js, React, Axios
- Golang, Gin, GORM
- MySQL 8 (Docker)
- Clean Architecture by Uncle Bob

## Cara Menjalankan

### 1. Jalankan MySQL via Docker

```bash
docker compose up -d
```

### 2. Backend `.env`

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=voucher_user
DB_PASS=voucher_pass
DB_NAME=voucher_db
PORT=8080
JWT_TOKEN=123456
```

### 3. Jalankan Backend

```bash
cd backend
go run cmd/api/main.go
```

### 4. Jalankan Frontend

```bash
cd frontend-discount-voucher-management-system
npm install
npm run dev
```

## API Ringkasan

- POST /login
- GET /vouchers
- GET /vouchers/:id
- POST /vouchers
- PUT /vouchers/:id
- DELETE /vouchers/:id
- POST /vouchers/upload-csv
- GET /vouchers/export

## Migration SQL

```sql
CREATE TABLE IF NOT EXISTS vouchers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  voucher_code VARCHAR(100) NOT NULL UNIQUE,
  discount_percent INT NOT NULL,
  expiry_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
