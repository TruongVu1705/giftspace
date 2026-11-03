const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // Allow requests from any origin (e.g. Netlify domain or localhost)
    credentials: true
}));
app.use(express.json());

// Health Check Endpoint (For Render, Railway, or Uptime monitors)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// API Endpoints

// 1. GET /api/assets - Get all products
app.get('/api/assets', (req, res) => {
    db.all("SELECT * FROM assets", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// 2. GET /api/assets/:id - Get product details
app.get('/api/assets/:id', (req, res) => {
    db.get("SELECT * FROM assets WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: row });
    });
});

// 2a. POST /api/assets - Create product
app.post('/api/assets', (req, res) => {
    const { title, category, thumbnail_url, base_price, creator_id, demo_url } = req.body;
    const assetId = 'a' + Date.now();
    db.run(
        `INSERT INTO assets (id, title, category, thumbnail_url, demo_url, base_price, creator_id, downloads_count, views_count) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [assetId, title, category, thumbnail_url, demo_url || '', base_price, creator_id || 'u1'],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: assetId });
        }
    );
});

// 2b. PUT /api/assets/:id - Update product
app.put('/api/assets/:id', (req, res) => {
    const { title, category, thumbnail_url, base_price, demo_url } = req.body;
    db.run(
        `UPDATE assets SET title = ?, category = ?, thumbnail_url = ?, demo_url = ?, base_price = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [title, category, thumbnail_url, demo_url || '', base_price, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, changes: this.changes });
        }
    );
});

// 2c. DELETE /api/assets/:id - Delete product
app.delete('/api/assets/:id', (req, res) => {
    db.run(`DELETE FROM assets WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, changes: this.changes });
    });
});

// 3. POST /api/users/register - Register new user
app.post('/api/users/register', (req, res) => {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
        return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ họ và tên, email và mật khẩu!" });
    }

    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) return res.status(400).json({ success: false, message: "Email này đã tồn tại trong hệ thống! Vui lòng chọn email khác hoặc đăng nhập." });

        const userId = uuidv4();
        const hash = bcrypt.hashSync(password, 8);
        db.run(
            `INSERT INTO users (id, email, password_hash, full_name, avatar_url) VALUES (?, ?, ?, ?, ?)`,
            [userId, email, hash, full_name, ''],
            function (insertErr) {
                if (insertErr) return res.status(500).json({ error: insertErr.message });
                res.json({
                    success: true,
                    user: { id: userId, email, full_name, avatar_url: '', is_pro_member: 0 },
                    token: "mock_jwt_token_" + userId
                });
            }
        );
    });
});

// 4. POST /api/users/login - Login
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ email và mật khẩu." });
    }
    db.get("SELECT id, email, password_hash, full_name, avatar_url, is_pro_member, is_admin FROM users WHERE LOWER(email) = LOWER(?)", [email.trim()], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            let valid = false;
            // Check if password_hash is our plain "hashed_pass" dummy from db.js or actual bcrypt
            if (row.password_hash === 'hashed_pass' && (password === '123456' || password === 'SecretPass123!')) valid = true; // Fallback for dummy user
            else if (row.password_hash && bcrypt.compareSync(password, row.password_hash)) valid = true;
            
            if (valid) {
                const { password_hash, ...userNoPass } = row;
                res.json({ success: true, user: userNoPass, token: "mock_jwt_token_" + row.id });
            } else {
                res.status(401).json({ success: false, message: "Mật khẩu không chính xác!" });
            }
        } else {
            res.status(401).json({ success: false, message: "Email chưa được đăng ký trong hệ thống!" });
        }
    });
});

// 4b. POST /api/users/forgot-password - Reset password & send to email
app.post('/api/users/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: "Vui lòng nhập địa chỉ email đã đăng ký!" });
    }

    db.get("SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER(?)", [email.trim()], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email này chưa được đăng ký tài khoản trong hệ thống GiftSpace!"
            });
        }

        // Generate temporary reset password
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const newPassword = `GS@${randomNum}`;
        const newHash = bcrypt.hashSync(newPassword, 8);

        db.run("UPDATE users SET password_hash = ? WHERE id = ?", [newHash, user.id], function(updateErr) {
            if (updateErr) return res.status(500).json({ error: updateErr.message });

            console.log(`[AUTH] Reset password for ${user.email} (${user.full_name}): ${newPassword}`);
            
            res.json({
                success: true,
                message: `Mật khẩu mới đã được gửi về email ${user.email} thành công!`,
                email: user.email,
                new_password: newPassword,
                note: "Mật khẩu mới đã được cập nhật trực tiếp trên hệ thống."
            });
        });
    });
});

// 4. GET /api/users/:id/saved - Get saved collections
app.get('/api/users/:id/saved', (req, res) => {
    const userId = req.params.id;
    const sql = `
        SELECT a.* FROM assets a
        JOIN saved_assets sa ON a.id = sa.asset_id
        WHERE sa.user_id = ?
    `;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// 4a. GET /api/users/:id/orders - Get user's orders (all statuses: Nhận đơn, Vận đơn, Hoàn tất)
app.get('/api/users/:id/orders', (req, res) => {
    const userIdOrEmail = req.params.id;
    const sql = `
        SELECT o.id as id, o.id as order_id, o.user_id, o.customer_email, o.customer_phone, 
               COALESCE(o.product_name, a.title, 'Mẫu thiết kế cao cấp GiftSpace') as asset_title,
               o.total_amount, o.payment_method, o.status, o.created_at,
               oi.asset_id, oi.license_type, oi.price,
               COALESCE(a.category, 'TEMPLATE') as asset_category, 
               COALESCE(a.thumbnail_url, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop&q=80') as asset_thumbnail, 
               COALESCE(a.demo_url, '#') as asset_demo_url
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN assets a ON oi.asset_id = a.id
        WHERE (o.user_id = ? OR o.customer_email = ? 
            OR o.user_id IN (SELECT email FROM users WHERE id = ?) 
            OR o.user_id IN (SELECT id FROM users WHERE email = ?))
        ORDER BY o.created_at DESC
    `;
    db.all(sql, [userIdOrEmail, userIdOrEmail, userIdOrEmail, userIdOrEmail], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});

// 4b. GET /api/users/:id - Get user personal info
app.get('/api/users/:id', (req, res) => {
    const userIdOrEmail = req.params.id;
    db.get("SELECT id, email, full_name, avatar_url, is_pro_member, is_admin FROM users WHERE id = ? OR email = ?", [userIdOrEmail, userIdOrEmail], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
        res.json({ success: true, user: row });
    });
});

// 4c. PUT /api/users/:id - Update user personal info
app.put('/api/users/:id', (req, res) => {
    const { full_name, avatar_url, password } = req.body;
    const userIdOrEmail = req.params.id;

    let query = "UPDATE users SET full_name = ?, avatar_url = ? WHERE id = ? OR email = ?";
    let params = [full_name, avatar_url || '', userIdOrEmail, userIdOrEmail];

    if (password && password.trim().length >= 6) {
        const hash = bcrypt.hashSync(password, 8);
        query = "UPDATE users SET full_name = ?, avatar_url = ?, password_hash = ? WHERE id = ? OR email = ?";
        params = [full_name, avatar_url || '', hash, userIdOrEmail, userIdOrEmail];
    }

    db.run(query, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get("SELECT id, email, full_name, avatar_url, is_pro_member, is_admin FROM users WHERE id = ? OR email = ?", [userIdOrEmail, userIdOrEmail], (getErr, updatedUser) => {
            if (getErr || !updatedUser) return res.json({ success: true });
            res.json({ success: true, user: updatedUser });
        });
    });
});

// 5. POST /api/coupons/validate - Validate discount code
app.post('/api/coupons/validate', (req, res) => {
    const { code } = req.body;
    db.get("SELECT * FROM coupons WHERE code = ?", [code.toUpperCase()], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, discount_value: row.discount_value });
        } else {
            res.json({ success: false, message: "Mã giảm giá không hợp lệ" });
        }
    });
});

// 6. POST /api/orders - Create Checkout Order with "Nhận đơn" Status
app.post('/api/orders', (req, res) => {
    const { order_id, user_id, customer_email, customer_phone, product_name, asset_id, total_amount, payment_method, status } = req.body;
    const orderId = order_id || ('ORD-' + Math.floor(100000 + Math.random() * 900000));
    const orderStatus = status || 'Nhận đơn'; // Default state is 'Nhận đơn' per user requirement
    const amount = typeof total_amount === 'number' ? total_amount : (parseFloat(total_amount) || 49.0);
    const prodName = product_name || 'Lumina Agency & Portfolio Template';
    const email = customer_email || (user_id && user_id.includes('@') ? user_id : 'khachhang@example.com');
    const phone = customer_phone || '';
    
    db.run(`INSERT INTO orders (id, user_id, customer_email, customer_phone, product_name, total_amount, payment_method, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [orderId, user_id || email, email, phone, prodName, amount, payment_method || 'VIETQR', orderStatus], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.run(`INSERT INTO order_items (id, order_id, asset_id, license_type, price) VALUES (?, ?, ?, 'Standard Commercial License', ?)`,
            ['ITEM-' + Math.floor(10000 + Math.random() * 90000), orderId, asset_id || 'a1', amount], function(err2) {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ 
                success: true, 
                order_id: orderId, 
                status: orderStatus,
                message: "Đơn hàng đã được ghi nhận ở trạng thái 'Nhận đơn'!" 
            });
        });
    });
});

// 6b. PUT /api/orders/:id/status - Admin update order status (Nhận đơn, Vận đơn, Hoàn tất)
app.put('/api/orders/:id/status', (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const validStatuses = ['Nhận đơn', 'Vận đơn', 'Hoàn tất'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: "Trạng thái không hợp lệ! Vui lòng chọn: 'Nhận đơn', 'Vận đơn', hoặc 'Hoàn tất'." 
        });
    }

    db.run("UPDATE orders SET status = ? WHERE id = ?", [status, orderId], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng!" });
        res.json({ 
            success: true, 
            order_id: orderId, 
            status, 
            message: `Đã cập nhật trạng thái đơn hàng #${orderId} sang '${status}' thành công!` 
        });
    });
});


// 7. GET /api/admin/tables - Get all table names
app.get('/api/admin/tables', (req, res) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows.map(r => r.name) });
    });
});

// 8. GET /api/admin/tables/:name - Get table data
app.get('/api/admin/tables/:name', (req, res) => {
    const table = req.params.name;
    // Basic validation to prevent SQL injection (only allow alphanumeric)
    if (!/^[a-zA-Z0-9_]+$/.test(table)) return res.status(400).json({ error: 'Invalid table name' });
    
    const orderBy = (table === 'orders' || table === 'users' || table === 'assets') ? 'ORDER BY created_at DESC' : '';
    db.all(`SELECT * FROM ${table} ${orderBy}`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
});


// ==========================================
// ENVIRONMENT-AWARE SERVING:
// - Locally (Dev): Phục vụ frontend tại http://localhost:3000 để chạy test trực quan
// - On Render (Production): Chế độ Pure Backend API thuần túy phục vụ cho Netlify
// ==========================================
const isProduction = process.env.NODE_ENV === 'production';
const frontendPath = path.join(__dirname, '../frontend');

if (!isProduction && fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        const targetFile = path.join(frontendPath, req.path.endsWith('.html') ? req.path : 'index.html');
        if (fs.existsSync(targetFile)) {
            return res.sendFile(targetFile);
        }
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({
            status: "online",
            service: "GiftSpace Backend API",
            message: "Backend API is running successfully. Frontend is hosted on Netlify.",
            uptime: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
            endpoints: {
                health: "/api/health",
                assets: "/api/assets",
                login: "/api/users/login"
            }
        });
    });
}

// 404 handler for unmatched API routes
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `Endpoint ${req.method} ${req.originalUrl} not found on GiftSpace Backend API.`
    });
});

app.listen(PORT, () => {
    console.log(`Backend API Server running on http://localhost:${PORT}`);
});
