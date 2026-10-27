-- ============================================================================
-- NagaEd Software Developer Hurdle Task 1 — MySQL 8 Schema
-- File: backend/sql/schema.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS nagaed_assessment
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE nagaed_assessment;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

