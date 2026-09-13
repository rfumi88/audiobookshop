const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT
});
const wrap = fn => (req, res, next) =>
    Promise.resolve(fn(req, res)).catch(next);

const error = (res, code, message) =>
    res.status(code).json({ error: message });
const discount = value =>
    Math.max(0, Math.min(100, Number(value) || 0));

//тест
app.get('/api/test', (req, res) =>
    res.json({ message: 'API работает!', timestamp: new Date() })
);

app.get('/api/db-test', wrap(async (req, res) => {
    const r = await pool.query('SELECT NOW()');
    res.json({ message: 'Подключение к PostgreSQL работает', databaseTime: r.rows[0].now });
}));

//аудиокниги
app.get('/api/services', wrap(async (req, res) => {
    const { search, page, limit } = req.query;

    if (!search && !page && !limit) {
        const r = await pool.query(`
            SELECT s.*, c.id_category, c.category_name
            FROM services s JOIN categories c ON c.id_category = s.category_id
            WHERE s.is_active = TRUE ORDER BY s.id_service
        `);
        return res.json(r.rows);
    }

    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 5);
    const q = `%${search?.trim() || ''}%`;
    const where = `WHERE s.is_active = TRUE AND (s.service_name ILIKE $1 OR s.author ILIKE $1)`;
    const [count, items] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM services s ${where}`, [q]),
        pool.query(`
            SELECT s.*, c.id_category, c.category_name
            FROM services s JOIN categories c ON c.id_category = s.category_id
            ${where} ORDER BY s.id_service LIMIT $2 OFFSET $3
        `, [q, l, (p - 1) * l])
    ]);

    const total = Number(count.rows[0].count);

    res.json({
        items: items.rows,
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l)
    });
}));

app.put('/api/services/:id/discount', wrap(async (req, res) => {
    const r = await pool.query(`
        UPDATE services SET discount_percent = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id_service = $2
        RETURNING id_service, service_name, discount_percent
    `, [discount(req.body.discount_percent), req.params.id]);

    if (!r.rows.length) return error(res, 404, 'Аудиокнига не найдена');
    res.json({ message: 'Скидка на аудиокнигу обновлена', service: r.rows[0] });
}));

//категории
app.get('/api/categories', wrap(async (req, res) => {
    const r = await pool.query('SELECT id_category, category_name, description FROM categories ORDER BY id_category');
    res.json(r.rows);
}));

app.post('/api/categories', wrap(async (req, res) => {
    const { category_name, description } = req.body;
    if (!category_name?.trim()) return error(res, 400, 'Название категории обязательно');

    const r = await pool.query(
        'INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING *',
        [category_name.trim(), description?.trim() || null]
    );
    res.status(201).json(r.rows[0]);
}));

app.delete('/api/categories/:id', wrap(async (req, res) => {
    const used = await pool.query('SELECT COUNT(*) FROM services WHERE category_id = $1', [req.params.id]);
    if (Number(used.rows[0].count)) return error(res, 400, 'Нельзя удалить категорию, в которой есть аудиокниги');

    const r = await pool.query('DELETE FROM categories WHERE id_category = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return error(res, 404, 'Категория не найдена');

    res.json({ message: 'Категория успешно удалена', category: r.rows[0] });
}));

//пользователи
app.get('/api/users', wrap(async (req, res) => {
    const { search, page, limit } = req.query;
    const fields = 'id_user, email, first_name, last_name, middle_name, phone, coupon_code, discount_percent, role_id';

    if (!search && !page && !limit) {
        const r = await pool.query(`SELECT ${fields} FROM users ORDER BY id_user`);
        return res.json(r.rows);
    }

    const p = Math.max(1, Number(page) || 1);
    const l = Math.max(1, Number(limit) || 5);
    const q = `%${search?.trim() || ''}%`;
    const where = `WHERE email ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1 OR middle_name ILIKE $1`;

    const [count, items] = await Promise.all([
        pool.query(`SELECT COUNT(*) FROM users ${where}`, [q]),
        pool.query(`SELECT ${fields} FROM users ${where} ORDER BY id_user LIMIT $2 OFFSET $3`, [q, l, (p - 1) * l])
    ]);

    const total = Number(count.rows[0].count);

    res.json({
        items: items.rows,
        total,
        page: p,
        limit: l,
        pages: Math.ceil(total / l)
    });
}));

app.put('/api/users/:id/discount', wrap(async (req, res) => {
    const r = await pool.query(`
        UPDATE users SET coupon_code = $1, discount_percent = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id_user = $3
        RETURNING id_user, email, first_name, last_name, coupon_code, discount_percent
    `, [
        req.body.coupon_code?.trim() || null,
        discount(req.body.discount_percent),
        req.params.id
    ]);

    if (!r.rows.length) return error(res, 404, 'Пользователь не найден');
    res.json({ message: 'Персональная скидка обновлена', user: r.rows[0] });
}));

//корзина
app.get('/api/cart/:userId', wrap(async (req, res) => {
    const u = await pool.query(
        'SELECT coupon_code, discount_percent FROM users WHERE id_user = $1',
        [req.params.userId]
    );

    if (!u.rows.length) return error(res, 404, 'Пользователь не найден');

    let c = await pool.query(
        'SELECT id_cart FROM cart WHERE user_id = $1 LIMIT 1',
        [req.params.userId]
    );

    if (!c.rows.length) {
        c = await pool.query(
            'INSERT INTO cart (user_id) VALUES ($1) RETURNING id_cart',
            [req.params.userId]
        );
    }
    const id = c.rows[0].id_cart;
    const items = await pool.query(`
        SELECT ci.id_cart_item, ci.quantity, s.id_service, s.service_name, s.author, s.price, s.discount_percent,
        ROUND((s.price * (1 - COALESCE(s.discount_percent,0) / 100))::numeric,2) AS price_after_product_discount,
        ROUND((s.price * (1 - COALESCE(s.discount_percent,0) / 100) * ci.quantity)::numeric,2) AS item_total
        FROM cartitems ci JOIN services s ON s.id_service = ci.service_id
        WHERE ci.cart_id = $1 ORDER BY ci.id_cart_item
    `, [id]);
    const subtotal = items.rows.reduce((sum, x) => sum + Number(x.item_total || 0), 0);
    const userDiscountPercent = Number(u.rows[0].discount_percent) || 0;
    const userDiscountAmount = subtotal * userDiscountPercent / 100;

    res.json({
        cartId: id,
        items: items.rows,
        subtotal: subtotal.toFixed(2),
        userDiscountPercent: userDiscountPercent.toFixed(2),
        userDiscountAmount: userDiscountAmount.toFixed(2),
        couponCode: u.rows[0].coupon_code || null,
        total: (subtotal - userDiscountAmount).toFixed(2)
    });
}));

app.post('/api/cart', wrap(async (req, res) => {
    const { userId, serviceId, quantity = 1 } = req.body;

    if (!userId || !serviceId)
        return error(res, 400, 'Необходимо указать пользователя и аудиокнигу');

    const service = await pool.query(
        'SELECT is_active FROM services WHERE id_service = $1',
        [serviceId]
    );

    if (!service.rows.length) return error(res, 404, 'Аудиокнига не найдена');
    if (!service.rows[0].is_active) return error(res, 400, 'Аудиокнига недоступна');

    let cart = await pool.query(
        'SELECT id_cart FROM cart WHERE user_id = $1 LIMIT 1',
        [userId]
    );

    if (!cart.rows.length)
        cart = await pool.query(
            'INSERT INTO cart (user_id) VALUES ($1) RETURNING id_cart',
            [userId]
        );

    const r = await pool.query(`
        INSERT INTO cartitems (cart_id, service_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (cart_id, service_id)
        DO UPDATE SET quantity = cartitems.quantity + EXCLUDED.quantity
        RETURNING *
    `, [cart.rows[0].id_cart, serviceId, quantity]);

    res.status(201).json(r.rows[0]);
}));

app.put('/api/cart/item/:itemId', wrap(async (req, res) => {
    const { quantity } = req.body;

    if (!quantity || quantity < 1)
        return error(res, 400, 'Количество должно быть не меньше 1');

    const r = await pool.query(
        'UPDATE cartitems SET quantity = $1 WHERE id_cart_item = $2 RETURNING *',
        [quantity, req.params.itemId]
    );

    if (!r.rows.length) return error(res, 404, 'Товар в корзине не найден');
    res.json(r.rows[0]);
}));

app.delete('/api/cart/item/:itemId', wrap(async (req, res) => {
    const r = await pool.query(
        'DELETE FROM cartitems WHERE id_cart_item = $1 RETURNING *',
        [req.params.itemId]
    );

    if (!r.rows.length) return error(res, 404, 'Товар в корзине не найден');
    res.json({ message: 'Товар удалён из корзины' });
}));

//авторизация
app.post('/api/auth/register', wrap(async (req, res) => {
    const { email, password, first_name, last_name, middle_name, phone } = req.body;

    if (!email || !password || !first_name)
        return error(res, 400, 'Необходимо заполнить email, пароль и имя');

    const exists = await pool.query(
        'SELECT id_user FROM users WHERE email = $1',
        [email]
    );

    if (exists.rows.length)
        return error(res, 400, 'Пользователь с таким email уже существует');

    const r = await pool.query(`
        INSERT INTO users (role_id, email, password, first_name, last_name, middle_name, phone)
        VALUES (2, $1, $2, $3, $4, $5, $6)
        RETURNING id_user, role_id, email, first_name, last_name, middle_name, phone
    `, [
        email, password, first_name,
        last_name || null, middle_name || null, phone || null
    ]);

    await pool.query('INSERT INTO cart (user_id) VALUES ($1)', [r.rows[0].id_user]);

    res.status(201).json({
        message: 'Регистрация выполнена успешно',
        user: r.rows[0]
    });
}));

app.post('/api/auth/login', wrap(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return error(res, 400, 'Введите email и пароль');

    const r = await pool.query(`
        SELECT u.id_user, u.email, u.password, u.first_name, u.last_name, u.middle_name,
               u.phone, u.discount_percent, u.coupon_code, r.id_role, r.role_name
        FROM users u JOIN roles r ON r.id_role = u.role_id
        WHERE u.email = $1
    `, [email]);

    if (!r.rows.length || r.rows[0].password !== password)
        return error(res, 401, 'Неверный email или пароль');

    const user = r.rows[0];
    delete user.password;

    res.json({ message: 'Вход выполнен успешно', user });
}));

//заказы
app.post('/api/appointments/checkout', wrap(async (req, res) => {
    const { userId } = req.body;
    if (!userId) return error(res, 400, 'Необходимо указать пользователя');

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const cart = await client.query(
            'SELECT id_cart FROM cart WHERE user_id = $1 LIMIT 1',
            [userId]
        );

        if (!cart.rows.length) throw new Error('Корзина не найдена');
        const cartId = cart.rows[0].id_cart;
        const items = await client.query(
            'SELECT service_id, quantity FROM cartitems WHERE cart_id = $1',
            [cartId]
        );

        if (!items.rows.length) throw new Error('Корзина пуста');
        const orders = await client.query(`
            INSERT INTO appointments
            (user_id, service_id, appointment_date, appointment_time, status, quantity)
            SELECT $1, service_id, CURRENT_DATE, CURRENT_TIME, 'в ожидании', quantity
            FROM cartitems WHERE cart_id = $2
            RETURNING *
        `, [userId, cartId]);

        await client.query('DELETE FROM cartitems WHERE cart_id = $1', [cartId]);
        await client.query(
            'UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id_cart = $1',
            [cartId]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Заказ успешно оформлен',
            appointments: orders.rows
        });
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}));

app.get('/api/appointments/user/:userId', wrap(async (req, res) => {
    const r = await pool.query(`
        SELECT a.id_appointment, a.user_id, a.service_id, a.appointment_date,
               a.appointment_time, a.status, a.quantity,
               s.service_name, s.author, s.price, s.discount_percent
        FROM appointments a JOIN services s ON s.id_service = a.service_id
        WHERE a.user_id = $1 ORDER BY a.id_appointment DESC
    `, [req.params.userId]);

    res.json(r.rows);
}));

//ошибки
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Ошибка сервера' });
});

app.listen(PORT, () =>
    console.log(`Сервер запущен: http://localhost:${PORT}`)
);