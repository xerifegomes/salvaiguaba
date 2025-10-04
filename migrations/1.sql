
-- Tabela de estabelecimentos/lojistas
CREATE TABLE establishments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- padaria, restaurante, mercado
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  phone TEXT,
  owner_user_id TEXT, -- ID do usuário dono (lojista)
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de bags surpresa
CREATE TABLE bags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  establishment_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  original_price REAL,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  pickup_start_time TEXT NOT NULL, -- formato HH:MM
  pickup_end_time TEXT NOT NULL,   -- formato HH:MM
  pickup_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos/reservas
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bag_id INTEGER NOT NULL,
  customer_user_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  payment_method TEXT DEFAULT 'pix',
  payment_confirmed BOOLEAN DEFAULT 0,
  pickup_code TEXT NOT NULL, -- código para mostrar na retirada
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_establishments_location ON establishments(latitude, longitude);
CREATE INDEX idx_establishments_active ON establishments(is_active);
CREATE INDEX idx_bags_establishment ON bags(establishment_id);
CREATE INDEX idx_bags_active ON bags(is_active);
CREATE INDEX idx_bags_date ON bags(pickup_date);
CREATE INDEX idx_orders_customer ON orders(customer_user_id);
CREATE INDEX idx_orders_bag ON orders(bag_id);
CREATE INDEX idx_orders_status ON orders(status);
