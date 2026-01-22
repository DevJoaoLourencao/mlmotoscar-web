-- Migration: Atualizar tabela de clientes
-- Remove campos: status, city
-- Adiciona campo: birth_date
-- Torna email opcional (nullable)

-- 1. Adicionar coluna birth_date (data de nascimento)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS birth_date TEXT;

-- 2. Tornar email opcional (permitir NULL)
ALTER TABLE customers
ALTER COLUMN email DROP NOT NULL;

-- 3. Remover coluna status (se existir)
ALTER TABLE customers
DROP COLUMN IF EXISTS status;

-- 4. Remover coluna city (se existir)
ALTER TABLE customers
DROP COLUMN IF EXISTS city;

-- Comentários:
-- - birth_date: Formato DD/MM/YYYY (armazenado como TEXT)
-- - email: Agora é opcional
-- - Campos removidos: status, city

