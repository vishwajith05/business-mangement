# Enterprise Inventory, Sales, Profit & Invoice Management System

A production-grade, full-stack business management application built for small businesses with 4 role-based accounts (1 Admin, 3 Partners). Features real-time KPI metrics, stock tracking with negative inventory protection, accurate profit calculations (\(\text{Revenue} - \text{Cost}\)), independent tax accounting, PDF invoice generation, Excel data import/export, and complete deployment readiness for Vercel, Render, and Supabase PostgreSQL.

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@business.com` | `admin123` | **Full System Access** (Products, Stock Adjustments, All Sales, Profit Reports, Business Settings, Tax & Audit Logs) |
| **PARTNER 1 (North)** | `partner1@business.com` | `partner123` | Read-only Stock Catalog, Create Sales, View own Sales & Invoices |
| **PARTNER 2 (West)** | `partner2@business.com` | `partner223` | Read-only Stock Catalog, Create Sales, View own Sales & Invoices |
| **PARTNER 3 (South)** | `partner3@business.com` | `partner323` | Read-only Stock Catalog, Create Sales, View own Sales & Invoices |

---

## 🚀 Key System Features

1. **Role-Based Authentication & Protected Routes**:
   - Automatic redirect upon login (`ADMIN` &rarr; Admin Dashboard, `PARTNER` &rarr; Partner Dashboard).
   - JWT session tokens with strict role middleware enforcement.
   - Quick 1-click user switch overlay for testing.

2. **Executive Admin Dashboard (8 KPI Cards + 5 Recharts Graphs)**:
   - **8 KPI Cards**: Total Sales, Total Profit, Total Orders, Total Products, Current Stock Units, Low Stock Items, Out of Stock Items, Tax Collected.
   - **Date Range Filters**: Today, This Week, This Month, Last 6 Months, This Year.
   - **5 Dynamic Recharts**:
     1. *Sales & Profit Trend*: Timeline Area/Line chart comparing Sales, Cost, and Profit.
     2. *Sales by Product*: Horizontal Bar chart for revenue per SKU.
     3. *Sales by Partner*: Comparative Bar chart comparing Partner 1, 2, 3.
     4. *Stock Status Health*: Interactive Donut chart.
     5. *Profit Analysis Breakdown*: Financial waterfall breakdown.

3. **Master Product Catalog**:
   - Product SKU, Name, Category, Description, Purchase Price (Cost), Selling Price, Tax Rate %, Stock Units, Min Stock Threshold.
   - **Live Tax & Price Calculator**: Automatically calculates \(\text{Selling Price} + \text{Tax Amount} = \text{Price Including Tax}\).

4. **Inventory Control & Audit Trail**:
   - Dedicated Inventory table with status badges (`IN STOCK`, `LOW STOCK`, `OUT OF STOCK`).
   - Admin actions: Add Stock, Remove Stock, Set Stock.
   - Strict guard: Prevents negative stock.
   - Complete stock movement audit history.

5. **Sales POS Checkout & PDF Invoicing**:
   - Partner sales checkout modal with item selection and real-time subtotal, tax, and grand total.
   - Automatic stock deduction upon sale confirmation.
   - PDF Invoice streaming powered by PDFKit (includes business logo, GSTIN, itemized list, tax breakdown, terms).

6. **Tax Ledger & Audit Trail**:
   - Independent tax accounting (Tax is added to customer invoice total but tracked separately from profit).
   - System audit trail logging logins, price updates, stock changes, and sales.

7. **Excel Export**:
   - Export Products Catalog and Sales Ledger to formatted `.xlsx` files using ExcelJS.

---

## 🛠️ Project Structure

```
├── client/              # Frontend (React, Vite, TypeScript, Tailwind CSS, Recharts)
│   ├── src/
│   │   ├── api/         # Axios API Client
│   │   ├── components/  # Sidebar, Header, KPICard
│   │   ├── pages/       # Login, AdminDashboard, ProductManagement, InventoryManagement, SalesAndInvoices, PartnerDashboard, TaxAndAuditLogs, Settings
│   │   └── types/       # TypeScript Interfaces
│   └── vite.config.ts
├── server/              # Backend REST API (Node.js, Express, PDFKit, ExcelJS, JWT)
│   ├── src/
│   │   ├── routes/      # Auth, Products, Inventory, Sales, Invoices, Analytics, Reports, Settings
│   │   ├── store/       # In-Memory Stateful Store & Seed Data
│   │   └── server.ts
├── database/            # Database Schema & Seed Data
│   ├── schema.sql       # Supabase PostgreSQL Table Definitions & Triggers
│   └── seed.sql         # Initial Seed Data
├── vercel.json          # Vercel Deployment Configuration
└── render.yaml          # Render Deployment Configuration
```

---

## 🌐 Production Deployment Instructions

### 1. Database (Supabase PostgreSQL)
1. Log into your Supabase Dashboard and create a new project.
2. Open the **SQL Editor**.
3. Run the contents of [`database/schema.sql`](file:///c:/Users/HP/OneDrive/Desktop/business%20mangement/database/schema.sql) followed by [`database/seed.sql`](file:///c:/Users/HP/OneDrive/Desktop/business%20mangement/database/seed.sql).

### 2. Backend API (Render)
1. Push this repository to GitHub/GitLab.
2. On Render, select **New Service** &rarr; **Blueprint** and select `render.yaml`.
3. Set environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`.
4. Deploy the web service.

### 3. Frontend (Vercel)
1. Import the repository into Vercel.
2. Vercel will automatically detect `vercel.json`.
3. Set the API destination rewrite to your deployed Render URL.
4. Deploy!
