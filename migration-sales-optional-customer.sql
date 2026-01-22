-- Migration: Tornar cliente opcional nas vendas
-- Permite vendas sem cliente associado

-- 1. Tornar customer_id nullable
ALTER TABLE sales
ALTER COLUMN customer_id DROP NOT NULL;

-- 2. Tornar customer_name nullable
ALTER TABLE sales
ALTER COLUMN customer_name DROP NOT NULL;

-- Comentário: Agora é possível registrar vendas sem cliente associado
-- Útil para vendas rápidas (à vista) onde o cliente não quer se identificar




