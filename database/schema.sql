-- Database Schema for Supabase PostgreSQL / Business Management App

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'PARTNER')),
  partner_region VARCHAR(100) DEFAULT 'General',
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  can_edit_stock BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  meat_category VARCHAR(50) DEFAULT 'Beef',
  cut_type VARCHAR(100),
  image_url TEXT,
  storage_temp VARCHAR(50) DEFAULT '+2°C Chilled',
  description TEXT,
  purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price >= 0),
  selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00 CHECK (tax_rate >= 0),
  current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock_level INT NOT NULL DEFAULT 5 CHECK (min_stock_level >= 0),
  unit VARCHAR(50) NOT NULL DEFAULT 'kg',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STOCK HISTORY LOGS
CREATE TABLE IF NOT EXISTS stock_logs (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(id),
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('ADD', 'REMOVE', 'ADJUST', 'SALE')),
  quantity_changed INT NOT NULL,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. SALES ORDERS TABLE
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(50) PRIMARY KEY,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  partner_id VARCHAR(50) NOT NULL REFERENCES users(id),
  partner_name VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_gross_profit NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_tax NUMERIC(12, 2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'Cash',
  status VARCHAR(20) DEFAULT 'COMPLETED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. SALE ITEMS TABLE
CREATE TABLE IF NOT EXISTS sale_items (
  id VARCHAR(50) PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_purchase_price NUMERIC(12, 2) NOT NULL,
  unit_selling_price NUMERIC(12, 2) NOT NULL,
  tax_rate NUMERIC(5, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) NOT NULL,
  item_subtotal NUMERIC(12, 2) NOT NULL,
  item_cost NUMERIC(12, 2) NOT NULL,
  item_profit NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. BUSINESS SETTINGS TABLE
CREATE TABLE IF NOT EXISTS business_settings (
  id INT PRIMARY KEY DEFAULT 1,
  business_name VARCHAR(255) NOT NULL DEFAULT 'Nexus Enterprise Solutions',
  tagline VARCHAR(255) DEFAULT 'Production-Grade Business Management System',
  logo_url TEXT,
  tax_id VARCHAR(100) DEFAULT 'GSTIN27AABCU9603R1ZM',
  email VARCHAR(255) DEFAULT 'contact@nexus-enterprise.com',
  phone VARCHAR(50) DEFAULT '+91 98765 43210',
  address TEXT DEFAULT '101 Industrial Tech Park, Cyber City, HR 122002',
  currency_symbol VARCHAR(10) DEFAULT '₹',
  default_tax_rate NUMERIC(5, 2) DEFAULT 15.00,
  invoice_footer TEXT DEFAULT 'Thank you for your business! Payment due within 15 days.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(id),
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_partner ON sales(partner_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_logs_product ON stock_logs(product_id);
