-- ==========================================================================
-- V3 - User cart items
-- ==========================================================================

CREATE TABLE user_cart_items (
    id         BIGSERIAL    PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    product_id BIGINT       NOT NULL REFERENCES products(id),
    quantity   INTEGER      NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_user_cart_items_user ON user_cart_items(user_id);
