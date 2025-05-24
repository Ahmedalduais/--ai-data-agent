-- =====================================================
-- هيكل قاعدة البيانات لوكيل البيانات الذكي
-- AI Data Agent Database Schema
-- =====================================================

-- إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS inventorymanagement 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE inventorymanagement;

-- =====================================================
-- جدول العملاء (Customers)
-- =====================================================
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- جدول الموردين (Suppliers)
-- =====================================================
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- جدول المنتجات (Items)
-- =====================================================
CREATE TABLE items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_stock (stock_quantity)
);

-- =====================================================
-- جدول الفواتير (Invoices)
-- =====================================================
CREATE TABLE invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    invoice_date DATE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status ENUM('مسودة', 'مؤكدة', 'ملغية') DEFAULT 'مسودة',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    INDEX idx_date (invoice_date),
    INDEX idx_customer (customer_id)
);

-- =====================================================
-- جدول تفاصيل الفواتير (Invoice Details)
-- =====================================================
CREATE TABLE invoice_details (
    invoice_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    INDEX idx_invoice (invoice_id),
    INDEX idx_item (item_id)
);

-- =====================================================
-- جدول المشتريات (Purchases)
-- =====================================================
CREATE TABLE purchases (
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    purchase_date DATE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    status ENUM('مسودة', 'مؤكدة', 'مستلمة', 'ملغية') DEFAULT 'مسودة',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE,
    INDEX idx_date (purchase_date),
    INDEX idx_supplier (supplier_id)
);

-- =====================================================
-- جدول تفاصيل المشتريات (Purchase Details)
-- =====================================================
CREATE TABLE purchase_details (
    purchase_detail_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    INDEX idx_purchase (purchase_id),
    INDEX idx_item (item_id)
);

-- =====================================================
-- جدول حركات المخزون (Stock Movements)
-- =====================================================
CREATE TABLE stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    movement_type ENUM('شراء', 'بيع', 'إرجاع', 'تعديل') NOT NULL,
    quantity INT NOT NULL,
    movement_date DATE NOT NULL,
    reference_id INT, -- معرف الفاتورة أو المشتريات المرتبطة
    reference_type ENUM('فاتورة', 'مشتريات', 'تعديل'),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
    INDEX idx_item (item_id),
    INDEX idx_date (movement_date),
    INDEX idx_type (movement_type)
);

-- =====================================================
-- بيانات تجريبية (Sample Data)
-- =====================================================

-- إدراج عملاء تجريبيين
INSERT INTO customers (customer_name, phone, email, address) VALUES
('أحمد محمد', '01234567890', 'ahmed@example.com', 'القاهرة، مصر'),
('فاطمة علي', '01234567891', 'fatima@example.com', 'الإسكندرية، مصر'),
('محمد حسن', '01234567892', 'mohamed@example.com', 'الجيزة، مصر'),
('سارة أحمد', '01234567893', 'sara@example.com', 'المنصورة، مصر'),
('خالد حسن', '01234567894', 'khaled@example.com', 'أسوان، مصر');

-- إدراج موردين تجريبيين
INSERT INTO suppliers (supplier_name, contact_info, address) VALUES
('شركة الخضروات الطازجة', '01111111111', 'سوق العبور، القاهرة'),
('مزارع الفواكه المصرية', '01222222222', 'الإسماعيلية، مصر'),
('شركة اللحوم الطازجة', '01333333333', 'المنيا، مصر'),
('مصنع الألبان الذهبية', '01444444444', 'دمياط، مصر');

-- إدراج منتجات تجريبية
INSERT INTO items (item_name, category, unit_price, cost_price, stock_quantity) VALUES
('طماطم', 'خضروات', 5.50, 3.00, 100),
('خيار', 'خضروات', 4.00, 2.50, 80),
('جزر', 'خضروات', 3.50, 2.00, 60),
('بطاطس', 'خضروات', 4.50, 2.80, 120),
('تفاح', 'فواكه', 8.00, 5.00, 50),
('موز', 'فواكه', 6.00, 4.00, 70),
('برتقال', 'فواكه', 7.00, 4.50, 90),
('لحم بقري', 'لحوم', 120.00, 80.00, 25),
('دجاج', 'لحوم', 45.00, 30.00, 40),
('لبن', 'ألبان', 8.50, 6.00, 30);

-- إدراج فواتير تجريبية
INSERT INTO invoices (customer_id, invoice_date, total_amount, status) VALUES
(1, '2024-01-15', 150.00, 'مؤكدة'),
(2, '2024-01-16', 200.50, 'مؤكدة'),
(3, '2024-01-17', 75.00, 'مؤكدة'),
(1, '2024-01-18', 300.00, 'مؤكدة'),
(4, '2024-01-19', 125.75, 'مؤكدة');

-- إدراج تفاصيل الفواتير
INSERT INTO invoice_details (invoice_id, item_id, quantity, unit_price, subtotal) VALUES
(1, 1, 10, 5.50, 55.00),
(1, 2, 5, 4.00, 20.00),
(1, 5, 3, 8.00, 24.00),
(2, 8, 1, 120.00, 120.00),
(2, 9, 2, 45.00, 90.00),
(3, 6, 5, 6.00, 30.00),
(3, 7, 3, 7.00, 21.00),
(4, 1, 20, 5.50, 110.00),
(4, 3, 15, 3.50, 52.50),
(5, 10, 8, 8.50, 68.00);

-- =====================================================
-- فهارس إضافية لتحسين الأداء
-- =====================================================
CREATE INDEX idx_items_name ON items(item_name);
CREATE INDEX idx_customers_name ON customers(customer_name);
CREATE INDEX idx_suppliers_name ON suppliers(supplier_name);

-- =====================================================
-- إجراءات مخزنة مفيدة (Stored Procedures)
-- =====================================================

DELIMITER //

-- إجراء لحساب إجمالي المبيعات لعميل معين
CREATE PROCEDURE GetCustomerTotalSales(IN customer_id INT)
BEGIN
    SELECT 
        c.customer_name,
        COUNT(i.invoice_id) as total_invoices,
        SUM(i.total_amount) as total_sales
    FROM customers c
    LEFT JOIN invoices i ON c.customer_id = i.customer_id
    WHERE c.customer_id = customer_id
    GROUP BY c.customer_id, c.customer_name;
END //

-- إجراء للحصول على المنتجات منخفضة المخزون
CREATE PROCEDURE GetLowStockItems()
BEGIN
    SELECT 
        item_id,
        item_name,
        category,
        stock_quantity,
        min_stock_level
    FROM items 
    WHERE stock_quantity <= min_stock_level
    ORDER BY stock_quantity ASC;
END //

DELIMITER ;

-- =====================================================
-- عرض معلومات قاعدة البيانات
-- =====================================================
SELECT 'تم إنشاء قاعدة البيانات بنجاح!' as message;
SELECT COUNT(*) as total_tables FROM information_schema.tables 
WHERE table_schema = 'inventorymanagement';
