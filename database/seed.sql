-- Seed Data for Supabase PostgreSQL Database

-- 1. SEED USERS (Password hashes for testing: 'admin123', 'partner123', 'partner223', 'partner323')
INSERT INTO users (id, email, password_hash, name, role) VALUES
('u-admin-01', 'admin@business.com', '$2a$10$vN4.tS.R4fS.g4yJb5aJ0.8Gz3Q.s6K5D9L/3p6yM4W.e.3G1.7O2', 'System Administrator', 'ADMIN'),
('u-partner-01', 'partner1@business.com', '$2a$10$vN4.tS.R4fS.g4yJb5aJ0.8Gz3Q.s6K5D9L/3p6yM4W.e.3G1.7O2', 'Partner One (North Zone)', 'PARTNER 1'),
('u-partner-02', 'partner2@business.com', '$2a$10$vN4.tS.R4fS.g4yJb5aJ0.8Gz3Q.s6K5D9L/3p6yM4W.e.3G1.7O2', 'Partner Two (West Zone)', 'PARTNER 2'),
('u-partner-03', 'partner3@business.com', '$2a$10$vN4.tS.R4fS.g4yJb5aJ0.8Gz3Q.s6K5D9L/3p6yM4W.e.3G1.7O2', 'Partner Three (South Zone)', 'PARTNER 3')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED PRODUCTS
INSERT INTO products (id, name, sku, category, description, purchase_price, selling_price, tax_rate, current_stock, min_stock_level, unit) VALUES
('prod-001', 'Enterprise Server Rack 42U', 'SKU-SRV-42U', 'Hardware', 'Industrial grade 42U server rack enclosure with cooling', 45000.00, 68000.00, 18.00, 12, 3, 'units'),
('prod-002', 'Fiber Optic Transceiver 10G', 'SKU-FIB-10G', 'Networking', 'SFP+ 10Gbps optical transceiver module 10km', 1400.00, 2200.00, 18.00, 85, 15, 'pcs'),
('prod-003', 'Gigabit Smart Managed Switch', 'SKU-SW-24P', 'Networking', '24-Port L2+ managed switch with 4 SFP slots', 12500.00, 18900.00, 18.00, 18, 5, 'units'),
('prod-004', 'Commercial Smart UPS 3000VA', 'SKU-UPS-3K', 'Power', 'Online double conversion UPS 3kVA with LCD', 28000.00, 42000.00, 18.00, 6, 2, 'units'),
('prod-005', 'High Performance Thermal Paste 50g', 'SKU-THM-50G', 'Accessories', 'Premium diamond nano compound for high load heat dissipation', 450.00, 850.00, 12.00, 140, 25, 'tubes'),
('prod-006', 'Ergonomic Developer Workstation Chair', 'SKU-CHR-ERG', 'Furniture', 'High back mesh ergonomic chair with lumbar support', 8500.00, 14500.00, 18.00, 4, 5, 'units'), -- LOW STOCK
('prod-007', 'Cat6A Shielded Patch Cord 5m', 'SKU-CAB-C6A', 'Networking', 'Snagless SFTP Cat6A RJ45 copper patch cable', 180.00, 390.00, 12.00, 0, 20, 'pcs'), -- OUT OF STOCK
('prod-008', 'Enterprise NVMe SSD 3.84TB', 'SKU-SSD-3TB', 'Storage', 'U.2 PCIe 4.0 read-intensive enterprise solid state drive', 22000.00, 33500.00, 18.00, 22, 5, 'units')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED BUSINESS SETTINGS
INSERT INTO business_settings (id, business_name, tagline, tax_id, email, phone, address, currency_symbol, default_tax_rate) VALUES
(1, 'Nexus Enterprise Solutions', 'Production-Grade Business Management System', 'GSTIN27AABCU9603R1ZM', 'billing@nexus-enterprise.com', '+91 98765 43210', '101 Tech Boulevard, Cyber City, HR 122002', '₹', 15.00)
ON CONFLICT (id) DO NOTHING;
