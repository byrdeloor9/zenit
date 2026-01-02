-- Script para restaurar datos desde Supabase
-- IMPORTANTE: Ejecutar después de crear el schema con full_schema.sql
-- El usuario ID 1 (byron@gmail.com) ya existe y no se insertará

BEGIN;

-- Insertar usuarios (excluyendo ID 1 que ya existe)
INSERT INTO users (id, email, password, username, first_name, last_name, is_staff, is_active, date_joined, created_at, last_login, is_superuser) VALUES
(2, 'byronj1020@gmail.com', 'pbkdf2_sha256$1000000$U04aq6J4xVSP7ix74pgDsl$JscFpOLypfB58tdzaPeRqjG+DiuzJf8EcBSU15pfXgA=', 'byronj1020', 'Byron', 'De Loor', false, true, '2025-10-13T01:52:37.937056+00:00', '2025-10-13T01:52:38.236151+00:00', '2026-01-01T04:40:25.052382+00:00', false),
(3, 'bryanquirozr@gmail.com', 'pbkdf2_sha256$1000000$yw514HsuuQbgoebRxZ4r2Y$hOi6k5QXHzV3t8nvrIqZUNp+Q0O634JYQdhhGd80sZ4=', 'bryanquirozr', 'Bryan Andrés', 'Quiroz Rojas', false, true, '2025-10-13T02:10:50.679115+00:00', '2025-10-13T02:10:50.956745+00:00', '2025-10-13T02:18:24.998732+00:00', false),
(4, 'tamarasamaniegom@gmail.com', 'pbkdf2_sha256$1000000$jvhXeyoy15iz29jmNFEqIg$qKtn1/4PNKKh5VPaqKjbioKCbpGwpZrP1QXYQwvj0mw=', 'tamarasamaniegom', 'Tamara', 'Samaniego', false, true, '2025-10-13T02:12:35.581235+00:00', '2025-10-13T02:12:35.857836+00:00', '2025-11-10T01:53:45.444593+00:00', false),
(5, 'jr.cabsol98@gmail.com', 'pbkdf2_sha256$1000000$PUg2jaeUQF0OuKfuAsfCqm$lwrStTuCe2Bn91cUXciBm1k2CRe1CinCmrR6dAaFhBc=', 'jr.cabsol98', 'Jose', 'Cabrera', false, true, '2025-10-13T04:55:22.619461+00:00', '2025-10-13T04:55:22.874085+00:00', NULL, false),
(6, 'niico514@gmail.com', 'pbkdf2_sha256$1000000$fwwl57JWQgNKyYvoC0eZQu$CtEQLz1PfXm8OeyZTkyMkfwGarzM51YoAUdYA9SjT2E=', 'niico514', 'Nicole', 'Diaz', false, true, '2025-10-13T05:04:27.30951+00:00', '2025-10-13T05:04:27.583925+00:00', NULL, false),
(7, 'naranjostuard@gmail.com', 'pbkdf2_sha256$1000000$NLmy4Y89MAgWKa2UBOpLdc$G34FhdWW70/p9NNmTBulFha6Hb+MkvPwqt9HUab+rfU=', 'naranjostuard', 'ERLYN', 'BURGOS', false, true, '2025-10-13T15:39:59.972153+00:00', '2025-10-13T15:40:00.233848+00:00', NULL, false),
(8, 'mcsapo@gmail.com', 'pbkdf2_sha256$1000000$q7DpNrxKQLk45OGa53OwWi$KjGvOnEdhWuwl0T10ntWStvraYHoHH/GV8Vwc2N9g7E=', 'mcsapo', 'sebastian', 'cevallos', false, true, '2025-10-13T16:09:49.947381+00:00', '2025-10-13T16:09:50.216501+00:00', NULL, false),
(9, 'davidmorocho1420@gmail.com', 'pbkdf2_sha256$1000000$1HgGjkL0QlAHqyTGL2nP6g$9iZDMdMuG7PDrAt1JHBnY8lXea1Tn5ISSZE8F7uKGw8=', 'davidmorocho1420', 'David', 'Morocho', false, true, '2025-10-13T20:41:46.386528+00:00', '2025-10-13T20:41:46.652342+00:00', NULL, false),
(10, 'maicolcarrazco@gmail.com', 'pbkdf2_sha256$1000000$chWASUmHCZFoaPubZeFQIb$altYxTZs/TEhkc0qYNqPE5eqSSghANp2geSZJKpVHFI=', 'maicolcarrazco', 'Fabricio', 'Carrasco', false, true, '2025-10-14T02:50:58.43292+00:00', '2025-10-14T02:50:58.703056+00:00', '2025-10-14T02:52:24.945245+00:00', false),
(11, 'kevin.daul1@gmail.com', 'pbkdf2_sha256$1000000$kMv13u14Nq4xC7NyAgl5Xz$6xp2bR8NxyxOlHhGbTrNn3dPHNLZkp5gyxzraRcmBT0=', 'kevin.daul1', 'Kevin', 'Daul', false, true, '2025-10-16T13:56:16.717694+00:00', '2025-10-16T13:56:16.983435+00:00', NULL, false),
(12, 'admin@gmail.com', 'pbkdf2_sha256$1000000$h8QPayICIRDo9aAjs67ohF$mr3deb4A3oHme+5Gw+XRA5JLZIc3EBl/67DKQWb7YAE=', 'admin1', 'admin', 'admin', false, true, '2025-10-16T14:43:30.195716+00:00', '2025-10-16$14:43:30.469825+00:00', '2025-10-16T14:50:19.229389+00:00', false),
(13, 'luisalmeidatorres@gmail.com', 'pbkdf2_sha256$1000000$gdqIVoINisNQRsDuM9equc$ajrP3ybzEwgQyCy6ZJLTwixqYV4AD7vaM7XQSO4DVhY=', 'luisalmeidatorres', 'Luis', 'Almeida', false, true, '2025-10-16T15:49:32.526382+00:00', '2025-10-16T15:49:32.799252+00:00', NULL, false),
(14, 'romizalarre97@gmail.com', 'pbkdf2_sha256$1000000$cn6llaqtmXa8sIbN35btDu$3XCHh9Lldb6xnBWvzQo/kNZKlDHF3HgMjBeBlmnvg8k=', 'romizalarre97', 'Romina', 'Zalamea', false, true, '2025-10-17T03:17:39.778977+00:00', '2025-10-17T03:17:40.059947+00:00', NULL, false),
(15, 'kldeloor@gmail.com', 'pbkdf2_sha256$1000000$IEPiSC2BScdE4skJrc91TX$d98A/9mZ01xweYRZvqBy/NMHkKyEiGxBERFumTanW/0=', 'kldeloor', 'Katherine', 'De Loor', false, true, '2025-11-01T20:43:06.634707+00:00', '2025-11-01T20:43:06.935764+00:00', NULL, false);

-- Ajustar secuencia de usuarios
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Insertar cuentas
INSERT INTO accounts (id, name, type, color, balance, user_id, currency, created_at) VALUES
(2, 'Banco Guayaquil', 'bank', '#EC4899', 2064.06, 4, 'USD', '2025-10-13T02:14:01.570041+00:00'),
(3, 'Bg', 'bank', '#667eea', 54, 3, 'USD', '2025-10-13T02:19:09.682793+00:00'),
(4, 'Produbanco', 'bank', '#F59E0B', 168.93, 4, 'USD', '2025-10-13T02:22:45.207298+00:00'),
(5, 'Test', 'bank', '#667eea', 1000, 1, 'USD', '2025-10-13T02:40:21.274794+00:00'),
(7, 'Pietro acc', 'bank', '#667eea', 4000, 5, 'USD', '2025-10-13T04:56:07.552868+00:00'),
(8, 'Banco Guayaquil', 'bank', '#8B5CF6', 2368.48, 2, 'USD', '2025-10-14T00:04:41.926312+00:00'),
(9, 'Banco Produbanco', 'bank', '#84CC16', 79.09, 2, 'USD', '2025-10-14T00:05:41.656465+00:00'),
(10, 'Efectivo', 'bank', '#F97316', 3, 2, 'USD', '2025-10-14T19:09:03.824519+00:00'),
(11, 'Carro', 'bank', '#EF4444', 2000, 12, 'USD', '2025-10-16T14:46:37.815911+00:00'),
(12, 'Banco Guayaquil', 'bank', '#6366F1', 17, 15, 'USD', '2025-11-01T20:44:17.496267+00:00'),
(13, 'Bolivariano', 'bank', '#10B981', 100, 15, 'USD', '2025-11-01T20:44:35.359939+00:00'),
(14, 'JEP', 'bank', '#10B981', 11979.07, 4, 'USD', '2025-11-02T16:41:03.984286+00:00');

SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));

-- Insertar categorías
INSERT INTO categories (id, name, type, icon, user_id) VALUES
(1, 'Comida', 'Expense', '🍕', 3),
(3, 'House', 'Expense', '🏠', 2),
(4, 'Banco Guayaquil', 'Income', '💴', 2),
(5, 'BEE CODERS', 'Income', '💼', 2),
(6, 'Servicios Web', 'Expense', '📡', 2),
(7, 'Servicios', 'Expense', NULL, 2),
(8, 'Vehiculo', 'Expense', '🚗', 2),
(9, 'Despensa', 'Expense', '🛒', 2),
(10, 'Food', 'Expense', '🍝', 2),
(11, 'Cuerpo', 'Expense', '🏋️', 2),
(12, 'Salud', 'Expense', '💊', 2),
(13, 'BODA', 'Expense', '👔', 9),
(14, 'Auto', 'Expense', '🚗', 3),
(15, 'salario', 'Income', NULL, 12),
(16, 'salario', 'Income', NULL, 12),
(17, 'Vehículo', 'Expense', NULL, 15),
(18, 'Vestimenta', 'Expense', NULL, 2),
(19, 'Brasil', 'Expense', NULL, 4),
(20, 'Cuidado personal', 'Expense', NULL, 4),
(21, 'Alimentación', 'Expense', NULL, 4),
(22, 'Recarga Xiaomi', 'Expense', NULL, 4),
(23, 'Movilización', 'Expense', NULL, 4),
(24, 'Intereses mensuales BG', 'Income', NULL, 4),
(25, 'Recarga iPhone', 'Expense', NULL, 4),
(26, 'Meta BG Personal', 'Expense', NULL, 4),
(27, 'Deudas', 'Expense', NULL, 4),
(28, 'Casa', 'Expense', NULL, 4),
(29, 'Suscripciones', 'Expense', NULL, 4);

SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- Insertar budgets
INSERT INTO budgets (id, amount, status, user_id, created_at, period_end, updated_at, category_id, is_recurring, period_start) VALUES
(1, 30, 'Active', 2, '2025-10-14T00:08:33.576366+00:00', NULL, '2025-10-14T00:08:33.576386+00:00', 7, true, '2025-10-14'),
(2, 150, 'Active', 2, '2025-10-14T00:08:47.63778+00:00', NULL, '2025-10-14T00:08:47.637796+00:00', 10, true, '2025-10-14'),
(3, 150, 'Active', 2, '2025-10-14T00:09:13.132135+00:00', NULL, '2025-10-14T00:09:13.132155+00:00', 3, true, '2025-10-01'),
(4, 150, 'Active', 2, '2025-10-14T00:09:51.432066+00:00', NULL, '2025-10-14T00:09:51.432081+00:00', 8, true, '2025-10-14'),
(5, 1500, 'Active', 9, '2025-10-14T21:17:58.860221+00:00', '2025-11-13', '2025-10-14T21:17:58.860236+00:00', 13, false, '2025-10-14');

SELECT setval('budgets_id_seq', (SELECT MAX(id) FROM budgets));

-- Insertar goals
INSERT INTO goals (id, name, status, user_id, deadline, account_id, created_at, target_amount, current_amount) VALUES
(1, 'vacaciones', 'In Progress', 4, '2025-12-05', 2, '2025-10-13T02:26:11.880884+00:00', 600, 0.06),
(2, 'Angelita - Carro', 'In Progress', 2, '2026-09-27', 8, '2025-10-14T00:06:35.153229+00:00', 4000, 367),
(3, 'Brasil', 'In Progress', 2, NULL, 8, '2025-10-14T00:07:22.46826+00:00', 1000, 1000),
(4, 'Jr', 'In Progress', 2, '2027-10-13', 8, '2025-10-14T00:31:29.610018+00:00', 2000, 0);

SELECT setval('goals_id_seq', (SELECT MAX(id) FROM goals));

-- Insertar investments
INSERT INTO investments (id, name, notes, status, user_id, deadline, account_id, created_at, start_date, updated_at, maturity_date, policy_number, target_amount, current_amount, initial_amount, investment_type, institution_name, last_return_date, expected_return_rate, maturity_term_months) VALUES
(2, 'Angelita - Carro', NULL, 'active', 2, '2026-09-27', 8, '2025-10-14T07:24:52.828509+00:00', '2025-10-14', '2025-10-14T07:24:52.828522+00:00', NULL, NULL, 4000, 367, 0, 'goal', NULL, NULL, NULL, NULL),
(3, 'Brasil', NULL, 'active', 2, NULL, 8, '2025-10-14T07:24:52.935366+00:00', '2025-10-14', '2025-10-14T07:24:52.935382+00:00', NULL, NULL, 1000, 1000, 0, 'goal', NULL, NULL, NULL, NULL),
(4, 'Jr', NULL, 'active', 2, '2027-10-13', 8, '2025-10-14T07:24:53.042259+00:00', '2025-10-14', '2025-10-14T07:24:53.042275+00:00', NULL, NULL, 2000, 0, 0, 'goal', NULL, NULL, NULL, NULL);

SELECT setval('investments_id_seq', (SELECT MAX(id) FROM investments));

-- Insertar recurring_transactions
INSERT INTO recurring_transactions (id, name, notes, amount, user_id, end_date, frequency, is_active, account_id, created_at, start_date, category_id, day_of_period, transaction_type, last_generated_date) VALUES
(3, 'Sueldo Mensual', NULL, 1800, 2, NULL, 'monthly', true, 8, '2025-10-14T00:10:32.470414+00:00', '2025-10-14', 4, 27, 'Income', NULL),
(4, 'Cursor', NULL, 20, 2, NULL, 'monthly', true, 8, '2025-10-14T00:18:53.74622+00:00', '2025-10-14', 7, 1, 'Expense', NULL),
(5, 'Youtube Premiun', NULL, 4.99, 2, NULL, 'monthly', true, 9, '2025-10-14T00:21:48.446306+00:00', '2025-10-14', 7, 1, 'Expense', NULL),
(6, 'Taurus', NULL, 29.99, 2, NULL, 'monthly', true, 9, '2025-10-14T00:23:05.865983+00:00', '2025-10-14', 11, 1, 'Expense', NULL),
(7, 'Casa', NULL, 300, 2, NULL, 'monthly', true, 9, '2025-11-10T17:52:56.658399+00:00', '2025-11-10', NULL, 1, 'Expense', NULL);

SELECT setval('recurring_transactions_id_seq', (SELECT MAX(id) FROM recurring_transactions));

-- Insertar debts
INSERT INTO debts (id, notes, status, user_id, created_at, start_date, amount_paid, term_months, creditor_name, interest_rate, interest_type, monthly_payment, principal_amount) VALUES
(1, NULL, 'Active', 3, '2025-10-13T02:27:36.08384+00:00', '2025-10-13', 0, 6, 'Gris', 0, 'simple', 183.33, 1100),
(2, NULL, 'Active', 3, '2025-10-13T02:35:17.853146+00:00', '2025-10-13', 0, 7, 'Extra', 0, 'simple', 61, 427),
(3, NULL, 'Active', 3, '2025-10-13T02:46:32.553404+00:00', '2025-10-13', 0, 9, 'Maestría', 0, 'simple', 111.11, 1000),
(4, NULL, 'Active', 3, '2025-10-13T02:47:22.54419+00:00', '2025-10-13', 0, 3, 'Cuadro', 0, 'simple', 100, 300),
(5, 'Prestamo por algo', 'Active', 1, '2025-10-13T21:03:22.649159+00:00', '2025-10-13', 0, 12, 'Pago tarjeta', 10, 'simple', 183.33, 2000),
(8, NULL, 'Active', 2, '2025-10-14T00:16:12.539055+00:00', '2025-10-14', 1000, 24, 'Katita', 10, 'simple', 500, 10000),
(9, NULL, 'Active', 2, '2025-10-14T00:16:48.368308+00:00', '2025-10-14', 0, 12, 'Angelita', 10, 'simple', 366.66, 3999.98),
(10, NULL, 'Active', 9, '2025-10-14T19:59:28.224649+00:00', '2025-10-14', 0, 1, 'Plaza Shiva', 0, 'simple', 445, 445),
(11, NULL, 'Active', 9, '2025-10-14T20:01:28.234474+00:00', '2025-10-14', 0, 1, 'Maxi Eventos', 0, 'simple', 1017, 1017),
(12, NULL, 'Active', 9, '2025-10-14T20:03:08.205011+00:00', '2025-10-14', 0, 1, 'DJ', 0, 'simple', 200, 200),
(13, NULL, 'Active', 9, '2025-10-14T20:03:32.387327+00:00', '2025-10-14', 0, 1, 'Bendicion', 0, 'simple', 200, 200),
(14, NULL, 'Active', 9, '2025-10-14T20:05:10.995341+00:00', '2025-10-14', 0, 1, 'Flores', 0, 'simple', 75, 75),
(15, 'Debo pagar el 01 de cada mes', 'Active', 11, '2025-10-16T13:59:52.012245+00:00', '2025-10-16', 0, 6, 'Mi hermana', 0, 'simple', 100, 600),
(16, NULL, 'Active', 12, '2025-10-16T14:48:18.783864+00:00', '2025-10-16', 0, 12, 'Banco', 15, 'simple', 1916.67, 20000),
(17, NULL, 'Active', 3, '2025-10-18T19:13:40.789636+00:00', '2025-10-18', 0, 12, 'Visa BG', 16, 'simple', 195.27, 2020),
(18, NULL, 'Active', 3, '2025-10-18T19:16:13.447162+00:00', '2025-10-18', 0, 12, 'PeiGO', 16.06, 'simple', 9.67, 100);

SELECT setval('debts_id_seq', (SELECT MAX(id) FROM debts));

-- Insertar transactions
INSERT INTO transactions (id, type, amount, user_id, account_id, created_at, category_id, description, transaction_date) VALUES
(3, 'Expense', 8, 3, 3, '2025-10-13T02:22:12.626887+00:00', 1, 'Comida Eats Domingo', '2025-10-13'),
(5, 'Income', 100, 1, 5, '2025-10-13T02:42:17.972381+00:00', NULL, '123', '2025-10-13'),
(9, 'Expense', 3, 3, 3, '2025-10-14T16:49:34.389134+00:00', 1, 'Encebollado', '2025-10-14'),
(10, 'Expense', 6.75, 2, 8, '2025-10-14T19:09:20.985538+00:00', 10, 'Almuerzo', '2025-10-14'),
(11, 'Expense', 500, 2, 8, '2025-10-14T21:42:30.436614+00:00', NULL, 'Pago de deuda: Katita - 1er Pago', '2025-09-27'),
(12, 'Expense', 1.25, 2, 8, '2025-10-16T01:43:17.366288+00:00', 8, 'Parqueo BG', '2025-10-16'),
(13, 'Expense', 7, 2, 8, '2025-10-16T01:43:44.328571+00:00', 10, 'Shawarma', '2025-10-16'),
(14, 'Expense', 2, 3, 3, '2025-10-16T04:32:31.789484+00:00', 1, 'Desayuno', '2025-10-16'),
(15, 'Expense', 21, 3, 3, '2025-10-16T04:33:29.591296+00:00', 14, 'Parqueo', '2025-10-16'),
(16, 'Expense', 3000, 12, 11, '2025-10-16T14:47:10.927264+00:00', NULL, 'primera @ letra', '2025-10-16'),
(17, 'Expense', 3, 2, 10, '2025-10-16T20:33:16.615164+00:00', 10, 'Panadería', '2025-10-16'),
(18, 'Expense', 10.5, 2, 8, '2025-10-16T20:33:27.982188+00:00', NULL, 'Almuerzo', '2025-10-16'),
(19, 'Expense', 20, 3, 3, '2025-10-18T19:12:47.130947+00:00', 1, 'Comida', '2025-10-18'),
(20, 'Expense', 27.48, 2, 9, '2025-10-20T00:13:52.053768+00:00', 10, 'La costeñita Feat Tamz and Marco', '2025-10-20'),
(21, 'Expense', 43.1, 2, 9, '2025-10-20T00:14:11.833704+00:00', 8, 'Gasolina', '2025-10-20'),
(22, 'Expense', 20, 2, 8, '2025-10-20T00:14:52.425631+00:00', NULL, 'Angelita Veloz', '2025-10-20'),
(23, 'Expense', 7.58, 2, 9, '2025-10-22T03:22:45.536012+00:00', NULL, 'Boncibo - Cafes + Galletas', '2025-10-22'),
(24, 'Expense', 1.25, 2, 10, '2025-10-22T03:23:01.681675+00:00', 8, 'Parqueo', '2025-10-22'),
(25, 'Expense', 13.63, 2, 9, '2025-10-22T03:24:24.449042+00:00', 7, 'Games: Howarts legacy + Batman, The farmer was replaced', '2025-10-21'),
(26, 'Expense', 3.75, 2, 10, '2025-10-22T19:08:28.397277+00:00', 3, 'Vinagre', '2025-10-22'),
(27, 'Expense', 9.64, 2, 9, '2025-10-22T19:09:35.357666+00:00', 10, 'Chaulafan', '2025-10-22'),
(28, 'Expense', 500, 2, 8, '2025-11-01T07:19:58.875978+00:00', NULL, 'Pago de deuda: Katita - Pago 2', '2025-10-30'),
(29, 'Expense', 83, 15, 12, '2025-11-01T20:46:09.046381+00:00', 17, 'Pago de atm', '2025-11-01'),
(30, 'Expense', 30.61, 2, 8, '2025-11-03T05:35:23.963942+00:00', NULL, 'Shampoo BASSA + Desodorante + Spray de Pies', '2025-11-02'),
(31, 'Expense', 99.96, 2, 8, '2025-11-03T05:36:11.77067+00:00', 18, 'Ropa en Koaj (3 Camisas, 1 Pantalon)', '2025-11-02'),
(32, 'Expense', 171.36, 2, 8, '2025-11-03T05:36:47.526547+00:00', 18, '2 Zapatos Sketchers + medias', '2025-11-02'),
(33, 'Expense', 33.18, 2, 9, '2025-11-04T00:16:38.818748+00:00', 8, 'Gasolina Carro Katita', '2025-11-04'),
(34, 'Income', 13, 2, 8, '2025-11-04T00:17:27.456683+00:00', NULL, 'Pago de Chopsuey', '2025-11-04'),
(35, 'Expense', 4000, 4, 2, '2025-11-10T01:57:48.245676+00:00', NULL, 'Dinero Tito', '2025-11-08'),
(36, 'Expense', 60, 4, 2, '2025-11-10T02:00:01.030743+00:00', 19, 'Pan de azucar - 20 nov', '2025-11-07'),
(37, 'Expense', 103, 4, 2, '2025-11-10T02:01:09.26974+00:00', 19, 'Alquiler carro ($411.74)', '2025-11-10'),
(38, 'Expense', 18, 4, 2, '2025-11-10T02:02:06.65845+00:00', NULL, 'uñas', '2025-11-09'),
(40, 'Expense', 3, 4, 2, '2025-11-10T02:05:07.088147+00:00', 22, '', '2025-11-07'),
(41, 'Expense', 1.5, 4, 2, '2025-11-10T02:05:52.542668+00:00', 23, 'Taxi Alía - Estrella', '2025-11-07'),
(42, 'Expense', 6.5, 4, 2, '2025-11-10T02:06:22.481135+00:00', 23, 'Taxi Alía-Estrella', '2025-11-06'),
(43, 'Expense', 5, 4, 2, '2025-11-10T02:06:53.049382+00:00', 23, 'Expreso Centro Convenciones - Estrella', '2025-11-05'),
(44, 'Expense', 1.1, 4, 2, '2025-11-10T02:07:37.462947+00:00', 21, 'Chupetes-Galletas', '2025-11-05'),
(45, 'Income', 10, 4, 2, '2025-11-10T02:09:05.115142+00:00', NULL, 'Le presté a Anto en efectivo', '2025-11-06'),
(46, 'Income', 0.14, 4, 2, '2025-11-10T02:09:38.59607+00:00', 24, '', '2025-11-05'),
(47, 'Expense', 4.1, 4, 2, '2025-11-10T02:10:12.162336+00:00', 25, '', '2025-11-05'),
(48, 'Expense', 150, 4, 2, '2025-11-10T02:13:52.470558+00:00', 26, 'Meta 605.14 \n05 nov', '2025-11-05'),
(49, 'Expense', 20, 4, 2, '2025-11-10T02:17:11.543589+00:00', 27, 'Pago Oswaldo (micas)', '2025-11-04'),
(50, 'Expense', 9, 4, 2, '2025-11-10T02:17:36.536631+00:00', 27, 'Prestamo en efectivo', '2025-11-04'),
(51, 'Expense', 13, 4, 2, '2025-11-10T02:20:49.400753+00:00', 21, 'Cangrejo', '2025-11-03'),
(52, 'Expense', 100, 4, 2, '2025-11-10T02:21:27.481685+00:00', 28, 'Noviembre', '2025-11-03'),
(53, 'Expense', 655.46, 4, 2, '2025-11-10T02:23:00.811439+00:00', 19, 'Pasaje', '2025-08-02'),
(58, 'Expense', 63.51, 4, 4, '2025-11-10T02:31:53.128886+00:00', 21, 'Megamaxi Mall del Norte', '2025-11-03'),
(59, 'Expense', 21.17, 4, 4, '2025-11-10T02:32:32.541341+00:00', 21, 'Hipermarket Vergeles', '2025-11-03'),
(60, 'Expense', 39.06, 4, 4, '2025-11-10T02:33:23.056997+00:00', 21, 'Hiper Norte', '2025-11-03'),
(61, 'Expense', 12.21, 4, 4, '2025-11-10T02:34:16.090672+00:00', 21, 'Tigrillo - Uber', '2025-11-08'),
(62, 'Expense', 3.44, 4, 4, '2025-11-10T02:34:51.479848+00:00', 29, 'Google One', '2025-11-09');

SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));

-- Insertar debt_payments
INSERT INTO debt_payments (id, notes, amount, debt_id, account_id, created_at, payment_date, transaction_id) VALUES
(2, '1er Pago', 500, 8, 8, '2025-10-14T21:42:30.512845+00:00', '2025-09-27', 11),
(3, 'Pago 2', 500, 8, 8, '2025-11-01T07:19:59.069628+00:00', '2025-10-30', 28);

SELECT setval('debt_payments_id_seq', (SELECT MAX(id) FROM debt_payments));

-- Insertar transfers
INSERT INTO transfers (id, amount, user_id, created_at, to_account_id, transfer_date, from_account_id) VALUES
(3, 50, 2, '2025-10-14T19:09:34.548625+00:00', 10, '2025-10-14', 8),
(4, 70, 2, '2025-10-22T03:22:03.475381+00:00', 10, '2025-10-22', 8),
(6, 100, 2, '2025-11-04T00:16:14.591602+00:00', 9, '2025-11-04', 8);

SELECT setval('transfers_id_seq', (SELECT MAX(id) FROM transfers));

COMMIT;
