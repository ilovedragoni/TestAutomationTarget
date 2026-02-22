-- ==========================================================================
-- V2 - Users for authentication
-- ==========================================================================

CREATE TABLE app_users (
    id            BIGSERIAL       PRIMARY KEY,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    password_hash VARCHAR(255)    NOT NULL,
    display_name  VARCHAR(255)    NOT NULL,
    enabled       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_users_email ON app_users(email);
