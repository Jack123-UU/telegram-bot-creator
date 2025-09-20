-- Database initialization script for TeleBot Sales Platform
-- This script creates the initial database structure and sample data

-- Create database (if running manually)
-- CREATE DATABASE telebot_sales;

-- Connect to the database
\c telebot_sales;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sample data for development

-- Insert sample products
INSERT INTO products (name, description, category, country, type, price, cost_price, stock, status, validation_status) VALUES
('USA Phone Session', 'High-quality USA phone session file', 'session', 'US', 'phone', 15.99, 12.00, 50, 'active', 'valid'),
('UK Email Session', 'Premium UK email session file', 'session', 'GB', 'email', 12.99, 9.50, 30, 'active', 'valid'),
('China API Login', 'Mobile API login access for China', 'api', 'CN', 'mobile', 25.99, 20.00, 20, 'active', 'valid'),
('Russia Session Bundle', 'Complete Russia session package', 'session', 'RU', 'phone', 18.99, 15.00, 15, 'active', 'valid'),
('Global API Access', 'Universal API access token', 'api', NULL, 'api', 39.99, 30.00, 10, 'active', 'valid');

-- Insert sample API endpoints for mobile API category
INSERT INTO api_endpoints (product_id, endpoint_url, access_token, uuid, available_actions, rate_limit, is_active) VALUES
(3, 'https://miha.uk/tgapi/{token}/{uuid}/GetHTML', 'uWCSVDgG6XMaMT5C', 'fa7e47cc-d2d2-4ead-bfc1-039a7135f057', '["GetHTML", "SendMessage", "GetContacts"]', 100, true),
(5, 'https://api.example.com/mobile/{token}/{uuid}/Login', 'global-access-token-123', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '["Login", "Logout", "GetProfile"]', 50, true);

-- Insert sample payment rules
INSERT INTO payment_rules (rule_name, min_confirmations, payment_timeout_minutes, allowed_tokens, min_amount, max_amount, precision_digits, is_active) VALUES
('standard_usdt', 1, 15, '["USDT-TRC20"]', 0.000001, 999999.999999, 6, true),
('fast_payment', 0, 5, '["USDT-TRC20", "TRX"]', 0.001, 1000.0, 4, false);

-- Insert sample admin user
INSERT INTO users (tg_id, username, first_name, language_code, is_admin, balance, created_at) VALUES
(123456789, 'admin', 'Admin User', 'en', true, 1000.00, NOW());

-- Insert sample agent/distributor
INSERT INTO agents (name, email, api_key, commission_rate, is_active, payment_address, created_at) VALUES
('Test Distributor', 'distributor@example.com', 'dist-api-key-123456789', 15.00, true, 'TDistributorAddress123456789012345', NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_country ON products(country) WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_total_amount ON orders(total_amount);
CREATE INDEX IF NOT EXISTS idx_payments_tx_hash ON payments(tx_hash);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create a function to generate unique payment amounts
CREATE OR REPLACE FUNCTION generate_unique_payment_amount(base_amount DECIMAL(10,2))
RETURNS DECIMAL(18,6) AS $$
DECLARE
    unique_suffix INTEGER;
    result_amount DECIMAL(18,6);
    attempts INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    LOOP
        -- Generate random 4-digit suffix
        unique_suffix := floor(random() * 10000)::INTEGER;
        
        -- Create the unique amount
        result_amount := base_amount + (unique_suffix::DECIMAL / 1000000);
        
        -- Check if this amount already exists in active orders
        IF NOT EXISTS (
            SELECT 1 FROM orders 
            WHERE total_amount = result_amount 
            AND status IN ('pending_payment', 'paid')
            AND expires_at > NOW()
        ) THEN
            RETURN result_amount;
        END IF;
        
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            -- Fallback: use timestamp-based suffix
            unique_suffix := EXTRACT(EPOCH FROM NOW())::INTEGER % 1000000;
            result_amount := base_amount + (unique_suffix::DECIMAL / 1000000);
            RETURN result_amount;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up expired orders
CREATE OR REPLACE FUNCTION cleanup_expired_orders()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE orders 
    SET status = 'expired'
    WHERE status = 'pending_payment' 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Log successful initialization
INSERT INTO audit_logs (action, resource_type, new_values, created_at) VALUES
('database_init', 'system', '{"message": "Database initialized with sample data"}', NOW());

-- Display initialization summary
SELECT 
    'Database initialized successfully!' as message,
    (SELECT COUNT(*) FROM products) as sample_products,
    (SELECT COUNT(*) FROM users) as sample_users,
    (SELECT COUNT(*) FROM agents) as sample_agents,
    (SELECT COUNT(*) FROM api_endpoints) as sample_api_endpoints;