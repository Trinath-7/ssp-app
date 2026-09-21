-- ====================================================
-- SSP PROPERTIES & LOANS - RELATIONAL DATABASE DDL SCHEMA
-- Compatible with PostgreSQL / Supabase
-- ====================================================

-- 1. USERS & ROLES
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'AGENT', 'STAFF')),
    avatar TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AGENTS
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(50) PRIMARY KEY,
    agent_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    joining_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Active',
    assigned_cases_count INT DEFAULT 0,
    completed_cases_count INT DEFAULT 0,
    rating NUMERIC(2,1) DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alt_phone VARCHAR(20),
    email VARCHAR(150),
    dob DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    pan VARCHAR(20),
    aadhaar_status VARCHAR(20) DEFAULT 'Pending',
    occupation VARCHAR(100),
    annual_income NUMERIC(15,2) DEFAULT 0,
    assigned_agent_id VARCHAR(50) REFERENCES agents(agent_id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROPERTIES
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR(50) PRIMARY KEY,
    property_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    location VARCHAR(200) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    area NUMERIC(10,2) NOT NULL,
    area_unit VARCHAR(20) DEFAULT 'sq ft',
    bedrooms INT,
    bathrooms INT,
    parking VARCHAR(100),
    price NUMERIC(15,2) NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. LOANS
CREATE TABLE IF NOT EXISTS loans (
    id VARCHAR(50) PRIMARY KEY,
    loan_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    loan_type VARCHAR(50) NOT NULL,
    principal_amount NUMERIC(15,2) NOT NULL,
    interest_rate NUMERIC(5,2) NOT NULL,
    tenure_months INT NOT NULL,
    emi_amount NUMERIC(15,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    outstanding_amount NUMERIC(15,2) NOT NULL,
    next_due_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    assigned_agent_id VARCHAR(50) REFERENCES agents(agent_id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. LOAN EMI SCHEDULE
CREATE TABLE IF NOT EXISTS loan_emi_schedule (
    id VARCHAR(100) PRIMARY KEY,
    loan_id VARCHAR(50) REFERENCES loans(loan_id) ON DELETE CASCADE,
    emi_number INT NOT NULL,
    due_date DATE NOT NULL,
    principal_component NUMERIC(15,2) NOT NULL,
    interest_component NUMERIC(15,2) NOT NULL,
    emi_amount NUMERIC(15,2) NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    balance NUMERIC(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    paid_date DATE
);

-- 7. LOAN PAYMENTS
CREATE TABLE IF NOT EXISTS loan_payments (
    id VARCHAR(50) PRIMARY KEY,
    payment_id VARCHAR(50) UNIQUE NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    loan_id VARCHAR(50) REFERENCES loans(loan_id) ON DELETE CASCADE,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) NOT NULL,
    collected_by VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'Success',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. VEHICLES
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    reg_number VARCHAR(30) UNIQUE NOT NULL,
    chassis_number VARCHAR(100),
    engine_number VARCHAR(100),
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    manufacturing_year INT,
    color VARCHAR(50),
    owner_name VARCHAR(150) NOT NULL,
    owner_phone VARCHAR(20) NOT NULL,
    customer_id VARCHAR(50) REFERENCES customers(customer_id) ON DELETE SET NULL,
    loan_id VARCHAR(50) REFERENCES loans(loan_id) ON DELETE SET NULL,
    finance_company VARCHAR(150),
    assigned_agent_id VARCHAR(50) REFERENCES agents(agent_id) ON DELETE SET NULL,
    location VARCHAR(200),
    yard_location VARCHAR(200),
    repo_status VARCHAR(50) DEFAULT 'Pending',
    overdue_amount NUMERIC(15,2) DEFAULT 0,
    overdue_days INT DEFAULT 0,
    upload_date DATE DEFAULT CURRENT_DATE,
    confirmer_name VARCHAR(150),
    confirmer_phone VARCHAR(20),
    agency_name VARCHAR(150),
    pre_intimation_date DATE,
    post_intimation_date DATE,
    release_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. REPO STATUS HISTORY
CREATE TABLE IF NOT EXISTS repo_status_history (
    id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    reg_number VARCHAR(30) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    event_date DATE DEFAULT CURRENT_DATE,
    event_time VARCHAR(20),
    notes TEXT,
    location VARCHAR(200)
);

-- 10. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(50) PRIMARY KEY,
    document_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    file_size VARCHAR(50),
    file_url TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    entity_name VARCHAR(200),
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id VARCHAR(50),
    record_title VARCHAR(255),
    old_value TEXT,
    new_value TEXT,
    event_date DATE DEFAULT CURRENT_DATE,
    event_time VARCHAR(20)
);

-- 13. BUSINESS SETTINGS
CREATE TABLE IF NOT EXISTS business_settings (
    id INT PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(200) NOT NULL,
    tagline TEXT,
    phone VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    website VARCHAR(200),
    logo_url TEXT,
    tax_id VARCHAR(50),
    receipt_prefix VARCHAR(50),
    currency_symbol VARCHAR(10),
    enable_whatsapp_intimation BOOLEAN DEFAULT true,
    enable_sms_reminders BOOLEAN DEFAULT true,
    overdue_grace_period_days INT DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
