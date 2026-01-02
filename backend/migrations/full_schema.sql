-- Full Database Schema for Budget App
-- Generated from Supabase structure
-- This file creates all tables with proper dependencies order

-- ============================================
-- 1. Django Core Tables
-- ============================================

-- Django content types (required first for auth_permission)
CREATE TABLE IF NOT EXISTS public.django_content_type (
  id SERIAL PRIMARY KEY,
  app_label VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model)
);

-- Django migrations tracking
CREATE TABLE IF NOT EXISTS public.django_migrations (
  id BIGSERIAL PRIMARY KEY,
  app VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  applied TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Django sessions
CREATE TABLE IF NOT EXISTS public.django_session (
  session_key VARCHAR(40) PRIMARY KEY,
  session_data TEXT NOT NULL,
  expire_date TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS django_session_expire_date_a5c62663 ON public.django_session (expire_date);

-- ============================================
-- 2. Auth Tables (Django Authentication)
-- ============================================

-- Auth groups
CREATE TABLE IF NOT EXISTS public.auth_group (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
);

-- Auth permissions
CREATE TABLE IF NOT EXISTS public.auth_permission (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content_type_id INTEGER NOT NULL,
  codename VARCHAR(100) NOT NULL,
  CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co 
    FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq 
    UNIQUE (content_type_id, codename)
);

CREATE INDEX IF NOT EXISTS auth_permission_content_type_id_2f476e4b ON public.auth_permission (content_type_id);

-- Auth group permissions (many-to-many)
CREATE TABLE IF NOT EXISTS public.auth_group_permissions (
  id BIGSERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL,
  permission_id INTEGER NOT NULL,
  CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id 
    FOREIGN KEY (group_id) REFERENCES public.auth_group(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm 
    FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq 
    UNIQUE (group_id, permission_id)
);

CREATE INDEX IF NOT EXISTS auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions (group_id);
CREATE INDEX IF NOT EXISTS auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions (permission_id);

-- ============================================
-- 3. Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  password VARCHAR(128) NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
  username VARCHAR(150) NOT NULL UNIQUE,
  first_name VARCHAR(150) NOT NULL DEFAULT '',
  last_name VARCHAR(150) NOT NULL DEFAULT '',
  is_staff BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  email VARCHAR(254) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_username_06e46fe6 ON public.users (username);
CREATE INDEX IF NOT EXISTS users_email_243f6e77 ON public.users (email);

-- User groups (many-to-many)
CREATE TABLE IF NOT EXISTS public.users_groups (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  group_id INTEGER NOT NULL,
  CONSTRAINT users_groups_user_id_f500bee5_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT users_groups_group_id_2f3517aa_fk_auth_group_id 
    FOREIGN KEY (group_id) REFERENCES public.auth_group(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT users_groups_user_id_group_id_b88eab82_uniq 
    UNIQUE (user_id, group_id)
);

CREATE INDEX IF NOT EXISTS users_groups_user_id_f500bee5 ON public.users_groups (user_id);
CREATE INDEX IF NOT EXISTS users_groups_group_id_2f3517aa ON public.users_groups (group_id);

-- User permissions (many-to-many)
CREATE TABLE IF NOT EXISTS public.users_user_permissions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  permission_id INTEGER NOT NULL,
  CONSTRAINT users_user_permissions_user_id_92473840_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT users_user_permissio_permission_id_6d08dcd2_fk_auth_perm 
    FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT users_user_permissions_user_id_permission_id_43338c45_uniq 
    UNIQUE (user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS users_user_permissions_user_id_92473840 ON public.users_user_permissions (user_id);
CREATE INDEX IF NOT EXISTS users_user_permissions_permission_id_6d08dcd2 ON public.users_user_permissions (permission_id);

-- Django admin log
CREATE TABLE IF NOT EXISTS public.django_admin_log (
  id SERIAL PRIMARY KEY,
  action_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  object_id TEXT,
  object_repr VARCHAR(200) NOT NULL,
  action_flag SMALLINT NOT NULL CHECK (action_flag >= 0),
  change_message TEXT NOT NULL,
  content_type_id INTEGER,
  user_id BIGINT NOT NULL,
  CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co 
    FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT django_admin_log_user_id_c564eba6_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log (content_type_id);
CREATE INDEX IF NOT EXISTS django_admin_log_user_id_c564eba6 ON public.django_admin_log (user_id);

-- ============================================
-- 4. Budget App Core Tables
-- ============================================

-- Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id BIGINT NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#000000',
  CONSTRAINT accounts_user_id_7f1e1f1e_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS accounts_user_id_7f1e1f1e ON public.accounts (user_id);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  icon VARCHAR(100),
  user_id BIGINT,
  CONSTRAINT categories_user_id_4315f8c7_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS categories_user_id_4315f8c7 ON public.categories (user_id);

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  description VARCHAR(500),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  account_id BIGINT NOT NULL,
  category_id BIGINT,
  user_id BIGINT NOT NULL,
  CONSTRAINT transactions_account_id_d92b47af_fk_accounts_id 
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT transactions_category_id_65740af9_fk_categories_id 
    FOREIGN KEY (category_id) REFERENCES public.categories(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT transactions_user_id_766cc893_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS transactions_account_id_d92b47af ON public.transactions (account_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_65740af9 ON public.transactions (category_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_766cc893 ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS transactions_transaction_date_idx ON public.transactions (transaction_date);

-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id BIGSERIAL PRIMARY KEY,
  amount NUMERIC(15, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id BIGINT NOT NULL,
  category_id BIGINT NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT budgets_user_id_d4bb9f71_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT budgets_category_id_328a159f_fk_categories_id 
    FOREIGN KEY (category_id) REFERENCES public.categories(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS budgets_user_id_d4bb9f71 ON public.budgets (user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_328a159f ON public.budgets (category_id);

-- Budget History
CREATE TABLE IF NOT EXISTS public.budget_history (
  id BIGSERIAL PRIMARY KEY,
  previous_amount NUMERIC(15, 2),
  new_amount NUMERIC(15, 2) NOT NULL,
  previous_period_end DATE,
  new_period_end DATE,
  change_reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  budget_id BIGINT NOT NULL,
  changed_by_id BIGINT,
  CONSTRAINT budget_history_budget_id_8de3f158_fk_budgets_id 
    FOREIGN KEY (budget_id) REFERENCES public.budgets(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT budget_history_changed_by_id_77a4a773_fk_users_id 
    FOREIGN KEY (changed_by_id) REFERENCES public.users(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS budget_history_budget_id_8de3f158 ON public.budget_history (budget_id);
CREATE INDEX IF NOT EXISTS budget_history_changed_by_id_77a4a773 ON public.budget_history (changed_by_id);

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  deadline DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id BIGINT NOT NULL,
  account_id BIGINT,
  CONSTRAINT goals_user_id_7678e2da_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT goals_account_id_e837d7a5_fk_accounts_id 
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS goals_user_id_7678e2da ON public.goals (user_id);
CREATE INDEX IF NOT EXISTS goals_account_id_e837d7a5 ON public.goals (account_id);

-- Transfers
CREATE TABLE IF NOT EXISTS public.transfers (
  id BIGSERIAL PRIMARY KEY,
  amount NUMERIC(15, 2) NOT NULL,
  transfer_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  from_account_id BIGINT NOT NULL,
  to_account_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  CONSTRAINT transfers_from_account_id_7806716c_fk_accounts_id 
    FOREIGN KEY (from_account_id) REFERENCES public.accounts(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT transfers_to_account_id_39745d99_fk_accounts_id 
    FOREIGN KEY (to_account_id) REFERENCES public.accounts(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT transfers_user_id_14bb154f_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS transfers_from_account_id_7806716c ON public.transfers (from_account_id);
CREATE INDEX IF NOT EXISTS transfers_to_account_id_39745d99 ON public.transfers (to_account_id);
CREATE INDEX IF NOT EXISTS transfers_user_id_14bb154f ON public.transfers (user_id);

-- ============================================
-- 5. Debts Management
-- ============================================

-- Debts
CREATE TABLE IF NOT EXISTS public.debts (
  id BIGSERIAL PRIMARY KEY,
  creditor_name VARCHAR(255) NOT NULL,
  principal_amount NUMERIC(15, 2) NOT NULL,
  interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  term_months INTEGER NOT NULL,
  monthly_payment NUMERIC(15, 2) NOT NULL,
  amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  start_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id BIGINT NOT NULL,
  interest_type VARCHAR(50) NOT NULL DEFAULT 'simple',
  CONSTRAINT debts_user_id_d6be0085_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS debts_user_id_d6be0085 ON public.debts (user_id);

-- Debt Payments
CREATE TABLE IF NOT EXISTS public.debt_payments (
  id BIGSERIAL PRIMARY KEY,
  amount NUMERIC(15, 2) NOT NULL,
  payment_date DATE NOT NULL,
  notes VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  debt_id BIGINT NOT NULL,
  account_id BIGINT,
  transaction_id BIGINT UNIQUE,
  CONSTRAINT debt_payments_debt_id_ed8bf6a5_fk_debts_id 
    FOREIGN KEY (debt_id) REFERENCES public.debts(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT debt_payments_account_id_a5b11101_fk_accounts_id 
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT debt_payments_transaction_id_3c916447_fk_transactions_id 
    FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS debt_payments_debt_id_ed8bf6a5 ON public.debt_payments (debt_id);
CREATE INDEX IF NOT EXISTS debt_payments_account_id_a5b11101 ON public.debt_payments (account_id);
CREATE INDEX IF NOT EXISTS debt_payments_transaction_id_3c916447 ON public.debt_payments (transaction_id);

-- ============================================
-- 6. Recurring Transactions
-- ============================================

CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  frequency VARCHAR(50) NOT NULL,
  day_of_period INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  last_generated_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  account_id BIGINT NOT NULL,
  category_id BIGINT,
  user_id BIGINT NOT NULL,
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'Income',
  CONSTRAINT recurring_transactions_account_id_89c1b6dc_fk_accounts_id 
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT recurring_transactions_category_id_c83e452e_fk_categories_id 
    FOREIGN KEY (category_id) REFERENCES public.categories(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT recurring_transactions_user_id_2d0966f6_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS recurring_transactions_account_id_89c1b6dc ON public.recurring_transactions (account_id);
CREATE INDEX IF NOT EXISTS recurring_transactions_category_id_c83e452e ON public.recurring_transactions (category_id);
CREATE INDEX IF NOT EXISTS recurring_transactions_user_id_2d0966f6 ON public.recurring_transactions (user_id);

-- ============================================
-- 7. Investments
-- ============================================

-- Investments
CREATE TABLE IF NOT EXISTS public.investments (
  id BIGSERIAL PRIMARY KEY,
  investment_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  initial_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  target_amount NUMERIC(15, 2),
  policy_number VARCHAR(100),
  institution_name VARCHAR(255),
  expected_return_rate NUMERIC(5, 2),
  maturity_term_months INTEGER,
  maturity_date DATE,
  start_date DATE NOT NULL,
  deadline DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  account_id BIGINT,
  user_id BIGINT NOT NULL,
  last_return_date DATE,
  CONSTRAINT investments_account_id_af7ccdb1_fk_accounts_id 
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT investments_user_id_c642b863_fk_users_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS investments_account_id_af7ccdb1 ON public.investments (account_id);
CREATE INDEX IF NOT EXISTS investments_user_id_c642b863 ON public.investments (user_id);

-- Investment Transactions
CREATE TABLE IF NOT EXISTS public.investment_transactions (
  id BIGSERIAL PRIMARY KEY,
  transaction_type VARCHAR(50) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  account_id BIGINT NOT NULL,
  account_transaction_id BIGINT,
  investment_id BIGINT NOT NULL,
  CONSTRAINT investment_transactions_account_id_282c1254_fk_accounts_id 
    FOREIGN KEY (account_id) REFERENCES public.accounts(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT investment_transacti_account_transaction__404d3d53_fk_transacti 
    FOREIGN KEY (account_transaction_id) REFERENCES public.transactions(id) 
    ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT investment_transacti_investment_id_a7d3f2b7_fk_investmen 
    FOREIGN KEY (investment_id) REFERENCES public.investments(id) 
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS investment_transactions_account_id_282c1254 ON public.investment_transactions (account_id);
CREATE INDEX IF NOT EXISTS investment_transactions_account_transaction_id_404d3d53 ON public.investment_transactions (account_transaction_id);
CREATE INDEX IF NOT EXISTS investment_transactions_investment_id_a7d3f2b7 ON public.investment_transactions (investment_id);
