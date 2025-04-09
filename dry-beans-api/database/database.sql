-- database/database.sql
-- Perfectly matched to your exact schema

-- 1. Clean up existing objects
DROP TRIGGER IF EXISTS inventory_trigger ON dry_beans;
DROP FUNCTION IF EXISTS update_inventory();
DROP TABLE IF EXISTS bean_inventory;
DROP FUNCTION IF EXISTS get_bean_stats_by_class(VARCHAR);
DROP INDEX IF EXISTS idx_bean_class;

-- 2. Stored Procedure
CREATE OR REPLACE FUNCTION get_bean_stats_by_class(
    bean_type VARCHAR
) RETURNS TABLE(
    avg_area NUMERIC,
    avg_perimeter NUMERIC,
    bean_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(area)::NUMERIC(10,4),
        AVG(perimeter)::NUMERIC(10,4),
        COUNT(*)::BIGINT
    FROM dry_beans
    WHERE bean_class = bean_type;
END;
$$ LANGUAGE plpgsql;

-- 3. Inventory System
CREATE TABLE bean_inventory (
    bean_type VARCHAR(50) PRIMARY KEY,
    quantity INT DEFAULT 0
);

-- Initialize inventory using correct column name
INSERT INTO bean_inventory (bean_type, quantity)
SELECT bean_class, COUNT(*)
FROM dry_beans
GROUP BY bean_class
ON CONFLICT (bean_type) DO NOTHING;

-- Trigger function
CREATE OR REPLACE FUNCTION update_inventory()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO bean_inventory (bean_type, quantity)
        VALUES (NEW.bean_class, 1)
        ON CONFLICT (bean_type) DO UPDATE 
        SET quantity = bean_inventory.quantity + 1;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE bean_inventory 
        SET quantity = GREATEST(0, quantity - 1)
        WHERE bean_type = OLD.bean_class;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER inventory_trigger
AFTER INSERT OR DELETE ON dry_beans
FOR EACH ROW EXECUTE FUNCTION update_inventory();

-- 4. Performance Optimization
EXPLAIN ANALYZE SELECT * FROM dry_beans WHERE bean_class = 'DERMASON';
CREATE INDEX IF NOT EXISTS idx_bean_class ON dry_beans(bean_class);
EXPLAIN ANALYZE SELECT * FROM dry_beans WHERE bean_class = 'DERMASON';