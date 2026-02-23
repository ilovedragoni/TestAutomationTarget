-- ==========================================================================
-- V4 - User orders and order items
-- ==========================================================================

CREATE TABLE user_orders (
    id                    BIGSERIAL     PRIMARY KEY,
    user_id               BIGINT        NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    status                VARCHAR(32)   NOT NULL,
    currency              VARCHAR(8)    NOT NULL,
    subtotal              NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    shipping_full_name    VARCHAR(255)  NOT NULL,
    shipping_email        VARCHAR(255)  NOT NULL,
    shipping_address      VARCHAR(255)  NOT NULL,
    shipping_city         VARCHAR(255)  NOT NULL,
    shipping_postal_code  VARCHAR(32)   NOT NULL,
    shipping_country      VARCHAR(255)  NOT NULL,
    payment_method        VARCHAR(32)   NOT NULL,
    payment_card_last4    VARCHAR(4),
    payment_card_expiry   VARCHAR(5),
    payment_paypal_email  VARCHAR(255),
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE user_order_items (
    id                   BIGSERIAL     PRIMARY KEY,
    order_id             BIGINT        NOT NULL REFERENCES user_orders(id) ON DELETE CASCADE,
    product_id           BIGINT        NOT NULL REFERENCES products(id),
    product_name         VARCHAR(255)  NOT NULL,
    unit_price           NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    quantity             INTEGER       NOT NULL CHECK (quantity > 0),
    line_total           NUMERIC(10,2) NOT NULL CHECK (line_total >= 0),
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_orders_user ON user_orders(user_id);
CREATE INDEX idx_user_order_items_order ON user_order_items(order_id);
