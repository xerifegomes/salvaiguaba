-- Reverter Migration 4

-- Remover tabela de fotos
DROP TABLE IF EXISTS bag_photos;

-- Remover campos de aprovação
ALTER TABLE establishments DROP COLUMN is_approved;
ALTER TABLE establishments DROP COLUMN approved_at;
ALTER TABLE establishments DROP COLUMN approved_by_user_id;
ALTER TABLE establishments DROP COLUMN rejection_reason;

-- Remover logo_url
ALTER TABLE establishments DROP COLUMN logo_url;
