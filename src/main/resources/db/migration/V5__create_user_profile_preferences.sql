-- ==========================================================================
-- V5 - Saved checkout addresses and payment methods
-- ==========================================================================

CREATE TABLE user_addresses (
    id            BIGSERIAL    PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    label         VARCHAR(120) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    address       VARCHAR(255) NOT NULL,
    city          VARCHAR(255) NOT NULL,
    postal_code   VARCHAR(32)  NOT NULL,
    country       VARCHAR(255) NOT NULL,
    is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE user_payment_methods (
    id             BIGSERIAL    PRIMARY KEY,
    user_id        BIGINT       NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    label          VARCHAR(120) NOT NULL,
    method         VARCHAR(32)  NOT NULL,
    card_last4     VARCHAR(4),
    card_expiry    VARCHAR(5),
    paypal_email   VARCHAR(255),
    is_default     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_user_payment_methods_user ON user_payment_methods(user_id);
