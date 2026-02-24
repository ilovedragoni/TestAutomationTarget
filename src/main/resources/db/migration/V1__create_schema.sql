-- ==========================================================================
-- V1 – Initial schema for TestAutomationTarget
-- ==========================================================================

-- Categories
CREATE TABLE categories (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE products (
    id          BIGSERIAL       PRIMARY KEY,
    name        VARCHAR(255)    NOT NULL,
    description VARCHAR(255),
    price       NUMERIC(10,2)   NOT NULL DEFAULT 0,
    category_id BIGINT          REFERENCES categories(id),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category ON products(category_id);
