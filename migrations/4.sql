-- Migration 4: Adicionar suporte para imagens

-- Adicionar campo de logo para estabelecimentos
ALTER TABLE establishments ADD COLUMN logo_url TEXT;

-- Criar tabela para fotos das bags
CREATE TABLE IF NOT EXISTS bag_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bag_id INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (bag_id) REFERENCES bags(id) ON DELETE CASCADE
);

-- Índice para buscar fotos por bag
CREATE INDEX idx_bag_photos_bag_id ON bag_photos(bag_id);

-- Adicionar campos de aprovação para estabelecimentos
ALTER TABLE establishments ADD COLUMN is_approved INTEGER DEFAULT 0;
ALTER TABLE establishments ADD COLUMN approved_at TEXT;
ALTER TABLE establishments ADD COLUMN approved_by_user_id TEXT;
ALTER TABLE establishments ADD COLUMN rejection_reason TEXT;
