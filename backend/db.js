const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        full_name TEXT,
        avatar_url TEXT,
        is_pro_member BOOLEAN DEFAULT 0,
        is_admin BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Create Assets Table
    db.run(`CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        creator_id TEXT,
        title TEXT NOT NULL,
        category TEXT,
        thumbnail_url TEXT,
        demo_url TEXT,
        base_price REAL,
        downloads_count INTEGER DEFAULT 0,
        views_count INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users (id)
    )`);

    // 3. Create Saved Assets Table
    db.run(`CREATE TABLE IF NOT EXISTS saved_assets (
        user_id TEXT,
        asset_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, asset_id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (asset_id) REFERENCES assets (id)
    )`);

    // 4. Create Coupons Table
    db.run(`CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        discount_value REAL NOT NULL,
        expires_at DATETIME
    )`);

    // 5. Create Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        product_name TEXT,
        coupon_id TEXT,
        total_amount REAL,
        discount_amount REAL,
        payment_method TEXT,
        status TEXT DEFAULT 'Nhận đơn',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (coupon_id) REFERENCES coupons (id)
    )`);

    // Safe column migrations for existing SQLite databases
    const migrations = [
        "ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0",
        "ALTER TABLE orders ADD COLUMN customer_email TEXT",
        "ALTER TABLE orders ADD COLUMN customer_phone TEXT",
        "ALTER TABLE orders ADD COLUMN product_name TEXT"
    ];
    migrations.forEach(colSql => {
        db.run(colSql, () => {}); // Silently ignore if column already exists
    });

    // Normalize old status values if any
    db.run("UPDATE orders SET status = 'Nhận đơn' WHERE status = 'PENDING' OR status IS NULL", () => {});
    db.run("UPDATE orders SET status = 'Hoàn tất' WHERE status = 'SUCCESS' OR status = 'COMPLETED'", () => {});

    // 6. Create Order Items Table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT,
        asset_id TEXT,
        license_type TEXT,
        price REAL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (asset_id) REFERENCES assets (id)
    )`);

    console.log("Database initialized successfully.");

    // Insert dummy coupon if not exists
    db.get("SELECT * FROM coupons WHERE code = 'CREATOR10'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO coupons (id, code, discount_value) VALUES ('c1', 'CREATOR10', 10.00)`);
        }
    });

    // Insert a dummy user
    db.get("SELECT * FROM users WHERE email = 'vu.nguyen@example.com'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO users (id, email, password_hash, full_name, avatar_url, is_pro_member) 
                    VALUES ('u1', 'vu.nguyen@example.com', 'hashed_pass', 'Nguyễn Trường Vũ', '', 1)`);
        }
    });

    // Insert default Admin user if not exists
    db.get("SELECT * FROM users WHERE email = 'admin@giftspace.com'", (err, row) => {
        if (!row) {
            const hash = bcrypt.hashSync('123456', 8);
            db.run(`INSERT INTO users (id, email, password_hash, full_name, avatar_url, is_pro_member, is_admin) 
                    VALUES ('admin-id-123', 'admin@giftspace.com', ?, 'Administrator', '', 1, 1)`, [hash], (err) => {
                if (!err) console.log("Default Admin user seeded: admin@giftspace.com / 123456");
            });
        } else if (row.is_admin !== 1) {
            db.run("UPDATE users SET is_admin = 1 WHERE email = 'admin@giftspace.com'");
        }
    });
    
    // Insert some dummy assets matching the frontend UI
    db.get("SELECT * FROM assets WHERE id = 'a1'", (err, row) => {
        if (!row) {
            db.run(`INSERT INTO assets (id, creator_id, title, category, thumbnail_url, base_price, downloads_count) 
                    VALUES ('a1', 'u1', 'Lumina Agency & Portfolio Template', 'WEB TEMPLATE', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgf-lKA_EJfDrlTOl-7jnOx2TU53x8UHUJKR0OJj-CjlswaLYIqeqUFibvZi-mYiVBvciXhmXL5gHnojYtDDXIIih4daYr2pijZpU-JHGO0KUyNgVUM1TfTgK4RE-MG2jkgegTnvsvDHA4VnTjV8ppovoIuJjYsL0_CBJ1nQFjywrexvK4EyHj3-lG6MSWsFvdBZnua48P71i6vS6Hv6ua2jU2FVv2Z9WISe3_xdVnzAFxAnEpshV8', 49.00, 1500)`);
            db.run(`INSERT INTO assets (id, creator_id, title, category, thumbnail_url, base_price, downloads_count) 
                    VALUES ('a2', 'u1', 'Atelier Minimal E-Commerce UI Kit', 'UI KITS', 'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=400&auto=format&fit=crop&q=80', 49.00, 800)`);
            db.run(`INSERT INTO assets (id, creator_id, title, category, thumbnail_url, base_price, downloads_count) 
                    VALUES ('a3', 'u1', 'Nexus SaaS Dashboard Design System', 'DESIGN SYSTEM', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80', 59.00, 1200)`);
        }
    });

    // Insert sample orders covering all 3 required workflow states if table is empty
    db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
        if (!err && row && row.count === 0) {
            // Order 1: Hoàn tất (Completed)
            db.run(`INSERT INTO orders (id, user_id, customer_email, customer_phone, product_name, total_amount, payment_method, status, created_at)
                    VALUES ('ORD-9241', 'u1', 'vu.nguyen@example.com', '0912345678', 'Lumina Agency & Portfolio Template', 49.00, 'VIETQR', 'Hoàn tất', '2026-10-20 14:30:00')`);
            db.run(`INSERT INTO order_items (id, order_id, asset_id, license_type, price)
                    VALUES ('ITEM-1', 'ORD-9241', 'a1', 'Standard Commercial License', 49.00)`);

            // Order 2: Vận đơn (Processing)
            db.run(`INSERT INTO orders (id, user_id, customer_email, customer_phone, product_name, total_amount, payment_method, status, created_at)
                    VALUES ('ORD-8321', 'u1', 'vu.nguyen@example.com', '0912345678', 'Atelier Minimal E-Commerce UI Kit', 49.00, 'VIETQR', 'Vận đơn', '2026-10-24 09:15:00')`);
            db.run(`INSERT INTO order_items (id, order_id, asset_id, license_type, price)
                    VALUES ('ITEM-2', 'ORD-8321', 'a2', 'Standard Commercial License', 49.00)`);

            // Order 3: Nhận đơn (Order received)
            db.run(`INSERT INTO orders (id, user_id, customer_email, customer_phone, product_name, total_amount, payment_method, status, created_at)
                    VALUES ('ORD-7510', 'u1', 'vu.nguyen@example.com', '0912345678', 'Nexus SaaS Dashboard Design System', 59.00, 'VIETQR', 'Nhận đơn', '2026-10-26 18:40:00')`);
            db.run(`INSERT INTO order_items (id, order_id, asset_id, license_type, price)
                    VALUES ('ITEM-3', 'ORD-7510', 'a3', 'Standard Commercial License', 59.00)`);
        }
    });
});

module.exports = db;
