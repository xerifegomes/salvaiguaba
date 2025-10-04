
-- Inserir dados de exemplo para testar o app

-- Estabelecimento de exemplo em Iguaba Grande
INSERT INTO establishments (name, category, address, latitude, longitude, phone, is_active) VALUES 
('Padaria Central Iguaba', 'padaria', 'Rua Principal, 123 - Centro, Iguaba Grande - RJ', -22.8397, -42.2267, '(22) 9999-1234', 1),
('Restaurante do Porto', 'restaurante', 'Av. Beira Mar, 456 - Porto, Iguaba Grande - RJ', -22.8350, -42.2250, '(22) 9999-5678', 1),
('Mercadinho São José', 'mercado', 'Rua São José, 789 - Centro, Iguaba Grande - RJ', -22.8420, -42.2280, '(22) 9999-9012', 1);

-- Bags de exemplo para hoje
INSERT INTO bags (establishment_id, name, description, price, original_price, quantity_available, pickup_start_time, pickup_end_time, pickup_date, is_active) VALUES 
(1, 'Bag Surpresa da Padaria', 'Pães, bolos e doces frescos do dia', 12.90, 25.00, 5, '18:00', '20:00', date('now'), 1),
(1, 'Bag Doces e Salgados', 'Mix de salgados e doces variados', 15.50, 30.00, 3, '17:30', '19:30', date('now'), 1),
(2, 'Bag Almoço Especial', 'Pratos executivos e acompanhamentos', 18.90, 35.00, 4, '14:00', '16:00', date('now'), 1),
(2, 'Bag Jantar Surpresa', 'Pratos do jantar com sobremesa', 22.00, 45.00, 2, '20:00', '22:00', date('now'), 1),
(3, 'Bag Frutas e Verduras', 'Frutas e verduras frescas próximas do vencimento', 8.50, 20.00, 8, '16:00', '18:00', date('now'), 1),
(3, 'Bag Produtos Diversos', 'Mix de produtos variados com desconto', 10.90, 25.00, 6, '17:00', '19:00', date('now'), 1);

-- Bags para amanhã também
INSERT INTO bags (establishment_id, name, description, price, original_price, quantity_available, pickup_start_time, pickup_end_time, pickup_date, is_active) VALUES 
(1, 'Bag Matinal', 'Pães frescos e café da manhã', 9.90, 18.00, 4, '08:00', '10:00', date('now', '+1 day'), 1),
(2, 'Bag Executiva', 'Almoço executivo completo', 16.90, 32.00, 3, '12:00', '14:00', date('now', '+1 day'), 1),
(3, 'Bag Familiar', 'Produtos para toda família', 14.50, 28.00, 5, '15:00', '17:00', date('now', '+1 day'), 1);
