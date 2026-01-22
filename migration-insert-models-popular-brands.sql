-- Migration: Inserir modelos mais famosos de 5 marcas populares
-- Chevrolet, Fiat, Volkswagen (carros) | Honda, Yamaha (motos)

-- Modelos Chevrolet (carros)
INSERT INTO models (brand_id, name, type, active, order_index)
SELECT id, 'Onix', 'carro', true, 1 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Prisma', 'carro', true, 2 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Cruze', 'carro', true, 3 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Tracker', 'carro', true, 4 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Spin', 'carro', true, 5 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Equinox', 'carro', true, 6 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'S10', 'carro', true, 7 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Montana', 'carro', true, 8 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Celta', 'carro', true, 9 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
UNION ALL
SELECT id, 'Corsa', 'carro', true, 10 FROM brands WHERE name = 'Chevrolet' AND type = 'carro'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Modelos Fiat (carros)
INSERT INTO models (brand_id, name, type, active, order_index)
SELECT id, 'Uno', 'carro', true, 1 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Palio', 'carro', true, 2 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Strada', 'carro', true, 3 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Toro', 'carro', true, 4 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Argo', 'carro', true, 5 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Mobi', 'carro', true, 6 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Cronos', 'carro', true, 7 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Fiorino', 'carro', true, 8 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Ducato', 'carro', true, 9 FROM brands WHERE name = 'Fiat' AND type = 'carro'
UNION ALL
SELECT id, 'Doblo', 'carro', true, 10 FROM brands WHERE name = 'Fiat' AND type = 'carro'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Modelos Volkswagen (carros)
INSERT INTO models (brand_id, name, type, active, order_index)
SELECT id, 'Gol', 'carro', true, 1 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Polo', 'carro', true, 2 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Virtus', 'carro', true, 3 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'T-Cross', 'carro', true, 4 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Nivus', 'carro', true, 5 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Tiguan', 'carro', true, 6 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Amarok', 'carro', true, 7 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Saveiro', 'carro', true, 8 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Fox', 'carro', true, 9 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
UNION ALL
SELECT id, 'Jetta', 'carro', true, 10 FROM brands WHERE name = 'Volkswagen' AND type = 'carro'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Modelos Honda (motos)
INSERT INTO models (brand_id, name, type, active, order_index)
SELECT id, 'CG 160', 'moto', true, 1 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'CG 160 Fan', 'moto', true, 2 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'CB 300F Twister', 'moto', true, 3 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'CB 600F Hornet', 'moto', true, 4 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'CB 650F', 'moto', true, 5 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'CB 1000R', 'moto', true, 6 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'XRE 300', 'moto', true, 7 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'XRE 190', 'moto', true, 8 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'PCX 160', 'moto', true, 9 FROM brands WHERE name = 'Honda' AND type = 'moto'
UNION ALL
SELECT id, 'Biz 125', 'moto', true, 10 FROM brands WHERE name = 'Honda' AND type = 'moto'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Modelos Yamaha (motos)
INSERT INTO models (brand_id, name, type, active, order_index)
SELECT id, 'Fazer 250', 'moto', true, 1 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'Fazer 150', 'moto', true, 2 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'MT-03', 'moto', true, 3 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'MT-07', 'moto', true, 4 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'MT-09', 'moto', true, 5 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'XTZ 250 Lander', 'moto', true, 6 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'XTZ 150 Crosser', 'moto', true, 7 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'R3', 'moto', true, 8 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'R1', 'moto', true, 9 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
UNION ALL
SELECT id, 'NMax', 'moto', true, 10 FROM brands WHERE name = 'Yamaha' AND type = 'moto'
ON CONFLICT (brand_id, name) DO NOTHING;

