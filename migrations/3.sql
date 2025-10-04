
-- Inserir estabelecimentos de exemplo em Iguaba Grande
INSERT INTO establishments (name, category, address, latitude, longitude, phone, is_active) VALUES
('Padaria do João', 'padaria', 'Rua Principal, 123 - Centro, Iguaba Grande - RJ', -22.8397, -42.2267, '(22) 2664-1234', 1),
('Restaurante Sabor da Terra', 'restaurante', 'Av. Beira Mar, 456 - Praia de Iguaba, Iguaba Grande - RJ', -22.8387, -42.2257, '(22) 2664-5678', 1),
('Mercado Central', 'mercado', 'Rua do Comércio, 789 - Centro, Iguaba Grande - RJ', -22.8407, -42.2277, '(22) 2664-9012', 1),
('Lanchonete da Praia', 'lanchonete', 'Av. Atlântica, 321 - Praia de Iguaba, Iguaba Grande - RJ', -22.8377, -42.2247, '(22) 2664-3456', 1),
('Café Aroma', 'cafeteria', 'Rua das Flores, 654 - Centro, Iguaba Grande - RJ', -22.8417, -42.2287, '(22) 2664-7890', 1),
('Pizzaria Bella Vista', 'pizzaria', 'Av. Beira Mar, 987 - Praia de Iguaba, Iguaba Grande - RJ', -22.8367, -42.2237, '(22) 2664-2345', 1);

-- Inserir bags de exemplo
INSERT INTO bags (establishment_id, name, description, price, original_price, quantity_available, pickup_start_time, pickup_end_time, pickup_date, is_active) VALUES
(1, 'Bag Pães do Dia', 'Pães frescos e doces variados que sobraram do dia', 12.00, 25.00, 5, '18:00', '20:00', date('now'), 1),
(1, 'Bag Doces da Casa', 'Seleção de bolos e tortas do dia anterior', 15.00, 35.00, 3, '17:30', '19:30', date('now'), 1),
(2, 'Bag Almoço Especial', 'Pratos executivos variados prontos para levar', 18.00, 40.00, 4, '14:00', '16:00', date('now'), 1),
(2, 'Bag Jantar da Casa', 'Refeições completas preparadas no dia', 22.00, 50.00, 2, '19:00', '21:00', date('now'), 1),
(3, 'Bag Frutas e Verduras', 'Frutas e verduras frescas com pequenos defeitos', 10.00, 20.00, 8, '17:00', '19:00', date('now'), 1),
(3, 'Bag Padaria Mix', 'Pães, biscoitos e produtos de padaria variados', 8.00, 18.00, 6, '16:00', '18:00', date('now'), 1),
(4, 'Bag Lanche Surpresa', 'Sanduíches e salgados feitos hoje', 14.00, 28.00, 4, '15:00', '17:00', date('now'), 1),
(4, 'Bag Açaí e Vitaminas', 'Açaí e vitaminas preparados hoje', 12.00, 22.00, 3, '16:30', '18:30', date('now'), 1),
(5, 'Bag Café Gourmet', 'Cafés especiais e acompanhamentos doces', 16.00, 30.00, 3, '14:30', '16:30', date('now'), 1),
(5, 'Bag Brunch da Tarde', 'Seleção de itens para um brunch perfeito', 20.00, 45.00, 2, '15:00', '17:00', date('now'), 1),
(6, 'Bag Pizza Variada', 'Fatias de pizza de sabores diferentes', 16.00, 32.00, 5, '20:00', '22:00', date('now'), 1),
(6, 'Bag Esfihas Mix', 'Esfihas doces e salgadas variadas', 13.00, 26.00, 4, '19:30', '21:30', date('now'), 1);
