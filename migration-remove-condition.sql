-- Migration: Remove campo condition da tabela vehicles
-- Data: 2024

-- Remover índice se existir
DROP INDEX IF EXISTS idx_vehicles_condition;

-- Remover coluna condition
ALTER TABLE vehicles
  DROP COLUMN IF EXISTS condition;

