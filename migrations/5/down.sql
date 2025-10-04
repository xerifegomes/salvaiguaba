-- Migration 5 - Rollback

DROP INDEX IF EXISTS idx_payments_order;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_establishments_approval_status;

DELETE FROM system_settings WHERE key IN ('platform_fee_percentage', 'min_bag_price', 'max_bag_price', 'auto_approve_merchants');

DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS admins;

-- Remover colunas (SQLite não suporta DROP COLUMN diretamente)
-- Seria necessário recriar as tabelas sem essas colunas
