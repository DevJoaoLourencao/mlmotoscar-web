-- Migration: Adicionar campos do Facebook Marketplace à tabela vehicles
-- Execute este script no Supabase SQL Editor

-- Adicionar novos campos
ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'usado' CHECK (condition IN ('novo', 'usado')),
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS doors INTEGER,
  ADD COLUMN IF NOT EXISTS seats INTEGER;

-- Atualizar campos existentes para NOT NULL onde necessário
ALTER TABLE vehicles 
  ALTER COLUMN condition SET NOT NULL,
  ALTER COLUMN brand SET NOT NULL,
  ALTER COLUMN model SET NOT NULL;

-- Criar índices para melhorar performance nas buscas
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_model ON vehicles(model);
CREATE INDEX IF NOT EXISTS idx_vehicles_condition ON vehicles(condition);

-- Atualizar registros existentes com valores padrão se necessário
UPDATE vehicles 
SET 
  condition = COALESCE(condition, 'usado'),
  brand = COALESCE(brand, 'Não informado'),
  model = COALESCE(model, 'Não informado')
WHERE brand IS NULL OR model IS NULL OR condition IS NULL;

