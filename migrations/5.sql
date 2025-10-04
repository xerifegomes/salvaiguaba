-- Migration 5: Sistema Admin e Pagamentos

-- Tabela de admins
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT
);

-- Adicionar status de aprovação aos estabelecimentos (enum style)
ALTER TABLE establishments ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  pix_qr_code TEXT,
  pix_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Adicionar campo para comissão da plataforma
ALTER TABLE orders ADD COLUMN platform_fee REAL DEFAULT 0;
ALTER TABLE orders ADD COLUMN merchant_payout REAL DEFAULT 0;

-- Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_by TEXT
);

-- Inserir configurações padrão
INSERT INTO system_settings (key, value, description) VALUES 
  ('platform_fee_percentage', '10', 'Porcentagem de comissão da plataforma'),
  ('min_bag_price', '5', 'Preço mínimo de uma bag em R$'),
  ('max_bag_price', '100', 'Preço máximo de uma bag em R$'),
  ('auto_approve_merchants', 'false', 'Aprovar automaticamente novos estabelecimentos');

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_establishments_approval_status ON establishments(approval_status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
