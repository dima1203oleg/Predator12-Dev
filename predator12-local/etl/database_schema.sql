-- Normalized database schema for Ukrainian customs declarations
-- Star schema: fact table + dimension tables

-- Dimension: Companies (importers/exporters)
CREATE TABLE IF NOT EXISTS dim_company (
    company_id SERIAL PRIMARY KEY,
    edrpou VARCHAR(20) UNIQUE NOT NULL,
    company_name TEXT,
    company_name_hash VARCHAR(64), -- for PII masking
    address TEXT,
    company_status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, LIQUIDATED, SUSPENDED
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Dimension: Countries
CREATE TABLE IF NOT EXISTS dim_country (
    country_id SERIAL PRIMARY KEY,
    country_code VARCHAR(3) UNIQUE NOT NULL,
    country_name VARCHAR(100),
    iso_alpha2 VARCHAR(2),
    iso_alpha3 VARCHAR(3),
    region VARCHAR(50)
);

-- Dimension: HS Codes (hierarchical)
CREATE TABLE IF NOT EXISTS dim_hs_code (
    hs_code_id SERIAL PRIMARY KEY,
    hs_code_10 VARCHAR(10) UNIQUE NOT NULL,
    hs_code_6 VARCHAR(6) NOT NULL,
    hs_code_4 VARCHAR(4) NOT NULL,
    hs_code_2 VARCHAR(2) NOT NULL,
    description_10 TEXT,
    description_6 TEXT,
    description_4 TEXT,
    description_2 TEXT,
    unit_of_measure VARCHAR(10)
);

-- Dimension: Customs Offices
CREATE TABLE IF NOT EXISTS dim_customs_office (
    customs_office_id SERIAL PRIMARY KEY,
    customs_office_name VARCHAR(200) UNIQUE NOT NULL,
    region VARCHAR(100),
    customs_office_code VARCHAR(20)
);

-- Dimension: Incoterms
CREATE TABLE IF NOT EXISTS dim_incoterms (
    incoterms_id SERIAL PRIMARY KEY,
    incoterms_code VARCHAR(10) UNIQUE NOT NULL,
    incoterms_description TEXT
);

-- Dimension: Currency
CREATE TABLE IF NOT EXISTS dim_currency (
    currency_id SERIAL PRIMARY KEY,
    currency_code VARCHAR(3) UNIQUE NOT NULL,
    currency_name VARCHAR(50)
);

-- Dimension: Units of Measure
CREATE TABLE IF NOT EXISTS dim_unit_measure (
    unit_id SERIAL PRIMARY KEY,
    unit_code VARCHAR(10) UNIQUE NOT NULL,
    unit_description VARCHAR(100)
);

-- Fact table: Declaration Items (partitioned by date)
CREATE TABLE IF NOT EXISTS fact_declaration_item (
    declaration_item_id BIGSERIAL,
    
    -- Foreign keys to dimensions
    customs_office_id INTEGER REFERENCES dim_customs_office(customs_office_id),
    importer_id INTEGER REFERENCES dim_company(company_id),
    exporter_id INTEGER REFERENCES dim_company(company_id),
    hs_code_id INTEGER REFERENCES dim_hs_code(hs_code_id),
    country_origin_id INTEGER REFERENCES dim_country(country_id),
    country_dispatch_id INTEGER REFERENCES dim_country(country_id),
    trading_country_id INTEGER REFERENCES dim_country(country_id),
    incoterms_id INTEGER REFERENCES dim_incoterms(incoterms_id),
    currency_id INTEGER REFERENCES dim_currency(currency_id),
    unit_id INTEGER REFERENCES dim_unit_measure(unit_id),
    
    -- Declaration identifiers
    declaration_number VARCHAR(50) NOT NULL,
    declaration_type VARCHAR(20),
    line_number INTEGER NOT NULL,
    declaration_date DATE NOT NULL,
    
    -- Quantities and weights
    quantity DECIMAL(18,6),
    gross_weight_kg DECIMAL(18,6),
    net_weight_kg DECIMAL(18,6),
    customs_weight DECIMAL(18,6),
    
    -- Values (in original currency and USD)
    invoice_value_original DECIMAL(18,6),
    invoice_value_usd DECIMAL(18,6),
    calculated_invoice_value_usd_kg DECIMAL(18,6),
    customs_value_net_usd_kg DECIMAL(18,6),
    customs_value_gross_usd_kg DECIMAL(18,6),
    customs_value_usd_additional_unit DECIMAL(18,6),
    
    -- Reference prices and differences
    min_base_usd_kg DECIMAL(18,6),
    min_base_diff DECIMAL(18,6),
    net_customs_value_usd_kg DECIMAL(18,6),
    customs_value_diff_usd_kg DECIMAL(18,6),
    
    -- Rates and procedures
    preferential_rate DECIMAL(5,2),
    full_rate DECIMAL(5,2),
    special_procedure VARCHAR(10),
    contract_type VARCHAR(50),
    
    -- Additional fields
    delivery_place TEXT,
    trademark VARCHAR(200),
    goods_description TEXT,
    goods_description_hash VARCHAR(64), -- for PII masking
    
    -- Weight calculations
    weight_single DECIMAL(18,6),
    weight_diff DECIMAL(18,6),
    
    -- Data quality flags
    is_anomaly BOOLEAN DEFAULT FALSE,
    anomaly_type VARCHAR(100),
    data_quality_score DECIMAL(3,2),
    
    -- Audit fields
    source_file VARCHAR(255),
    processed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Composite primary key
    PRIMARY KEY (declaration_date, declaration_item_id),
    
    -- Unique constraint for business key
    UNIQUE (declaration_number, line_number, declaration_date)
    
) PARTITION BY RANGE (declaration_date);

-- Create partitions for fact table (by month)
CREATE TABLE IF NOT EXISTS fact_declaration_item_2024_01 PARTITION OF fact_declaration_item
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE IF NOT EXISTS fact_declaration_item_2024_02 PARTITION OF fact_declaration_item
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

CREATE TABLE IF NOT EXISTS fact_declaration_item_2024_03 PARTITION OF fact_declaration_item
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');

-- Add more partitions as needed...

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fact_decl_item_decl_number 
    ON fact_declaration_item (declaration_number);

CREATE INDEX IF NOT EXISTS idx_fact_decl_item_hs_code 
    ON fact_declaration_item (hs_code_id);

CREATE INDEX IF NOT EXISTS idx_fact_decl_item_importer 
    ON fact_declaration_item (importer_id);

CREATE INDEX IF NOT EXISTS idx_fact_decl_item_country_origin 
    ON fact_declaration_item (country_origin_id);

CREATE INDEX IF NOT EXISTS idx_fact_decl_item_customs_office 
    ON fact_declaration_item (customs_office_id);

CREATE INDEX IF NOT EXISTS idx_fact_decl_item_anomaly 
    ON fact_declaration_item (is_anomaly) WHERE is_anomaly = TRUE;

-- Indexes on dimension tables
CREATE INDEX IF NOT EXISTS idx_company_edrpou ON dim_company (edrpou);
CREATE INDEX IF NOT EXISTS idx_company_status ON dim_company (company_status);
CREATE INDEX IF NOT EXISTS idx_hs_code_hierarchy ON dim_hs_code (hs_code_6, hs_code_4, hs_code_2);

-- Views for different access levels

-- Masked view for free tier users
CREATE OR REPLACE VIEW fact_declaration_item_masked AS
SELECT 
    declaration_item_id,
    customs_office_id,
    MD5(importer_id::text) as importer_id_hash,
    hs_code_id,
    country_origin_id,
    country_dispatch_id,
    trading_country_id,
    incoterms_id,
    currency_id,
    unit_id,
    declaration_date,
    quantity,
    gross_weight_kg,
    net_weight_kg,
    customs_weight,
    -- Mask sensitive financial data
    CASE WHEN invoice_value_usd > 100000 THEN ROUND(invoice_value_usd, -3) 
         ELSE invoice_value_usd END as invoice_value_usd_masked,
    calculated_invoice_value_usd_kg,
    customs_value_net_usd_kg,
    preferential_rate,
    full_rate,
    special_procedure,
    goods_description_hash,
    is_anomaly,
    anomaly_type,
    processed_at
FROM fact_declaration_item;

-- Full view for paid tier users
CREATE OR REPLACE VIEW fact_declaration_item_full AS
SELECT * FROM fact_declaration_item;

-- Analytical views

-- Monthly aggregations
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_trade_stats AS
SELECT 
    DATE_TRUNC('month', declaration_date) as trade_month,
    hs.hs_code_6,
    hs.description_6,
    co_origin.country_code as origin_country,
    co_dispatch.country_code as dispatch_country,
    customs.customs_office_name,
    COUNT(*) as declaration_count,
    SUM(quantity) as total_quantity,
    SUM(net_weight_kg) as total_net_weight_kg,
    SUM(invoice_value_usd) as total_invoice_value_usd,
    AVG(calculated_invoice_value_usd_kg) as avg_price_per_kg,
    COUNT(CASE WHEN is_anomaly THEN 1 END) as anomaly_count
FROM fact_declaration_item f
LEFT JOIN dim_hs_code hs ON f.hs_code_id = hs.hs_code_id
LEFT JOIN dim_country co_origin ON f.country_origin_id = co_origin.country_id
LEFT JOIN dim_country co_dispatch ON f.country_dispatch_id = co_dispatch.country_id
LEFT JOIN dim_customs_office customs ON f.customs_office_id = customs.customs_office_id
GROUP BY 1,2,3,4,5,6;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_trade_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_monthly_trade_stats;
END;
$$ LANGUAGE plpgsql;

-- Function to create new partitions automatically
CREATE OR REPLACE FUNCTION create_monthly_partition(target_date DATE)
RETURNS void AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    table_name TEXT;
BEGIN
    start_date := DATE_TRUNC('month', target_date);
    end_date := start_date + INTERVAL '1 month';
    table_name := 'fact_declaration_item_' || TO_CHAR(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF fact_declaration_item 
                    FOR VALUES FROM (%L) TO (%L)', 
                   table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Row Level Security for access control
ALTER TABLE fact_declaration_item ENABLE ROW LEVEL SECURITY;

-- Policy for masked access (free tier)
CREATE POLICY fact_item_masked_access ON fact_declaration_item
    FOR SELECT
    TO role_free_tier
    USING (true); -- All rows visible but through masked view

-- Policy for full access (paid tier)
CREATE POLICY fact_item_full_access ON fact_declaration_item
    FOR ALL
    TO role_paid_tier
    USING (true);

-- Roles
CREATE ROLE IF NOT EXISTS role_free_tier;
CREATE ROLE IF NOT EXISTS role_paid_tier;
CREATE ROLE IF NOT EXISTS role_admin;

-- Grants
GRANT SELECT ON fact_declaration_item_masked TO role_free_tier;
GRANT SELECT ON fact_declaration_item_full TO role_paid_tier;
GRANT ALL ON ALL TABLES IN SCHEMA public TO role_admin;

-- Comments for documentation
COMMENT ON TABLE fact_declaration_item IS 'Main fact table for customs declarations, partitioned by declaration_date';
COMMENT ON COLUMN fact_declaration_item.is_anomaly IS 'Flag indicating if this declaration item was detected as anomalous';
COMMENT ON COLUMN fact_declaration_item.data_quality_score IS 'Score from 0.0 to 1.0 indicating data completeness and quality';
COMMENT ON VIEW fact_declaration_item_masked IS 'Masked view for free tier users - sensitive data is hashed or rounded';
