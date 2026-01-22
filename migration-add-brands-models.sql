-- Migration: Adicionar tabelas de marcas e modelos e atualizar vehicles
-- Execute este script no Supabase SQL Editor

-- Criar tabela de Marcas
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('carro', 'moto')),
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);

-- Criar tabela de Modelos
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('carro', 'moto')),
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  UNIQUE(brand_id, name)
);

-- Adicionar colunas brand_id e model_id na tabela vehicles
ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS model_id UUID REFERENCES models(id) ON DELETE RESTRICT;

-- Remover colunas doors e seats se existirem
ALTER TABLE vehicles 
  DROP COLUMN IF EXISTS doors,
  DROP COLUMN IF EXISTS seats;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_brands_type ON brands(type);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(active);
CREATE INDEX IF NOT EXISTS idx_brands_order ON brands(order_index);

CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_type ON models(type);
CREATE INDEX IF NOT EXISTS idx_models_active ON models(active);
CREATE INDEX IF NOT EXISTS idx_models_order ON models(order_index);

CREATE INDEX IF NOT EXISTS idx_vehicles_brand_id ON vehicles(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_model_id ON vehicles(model_id);

-- Habilitar RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Políticas para brands (público pode ler, apenas autenticados podem escrever)
CREATE POLICY IF NOT EXISTS "Brands são públicos para leitura"
  ON brands FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Apenas usuários autenticados podem inserir marcas"
  ON brands FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Apenas usuários autenticados podem atualizar marcas"
  ON brands FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Apenas usuários autenticados podem deletar marcas"
  ON brands FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para models (público pode ler, apenas autenticados podem escrever)
CREATE POLICY IF NOT EXISTS "Models são públicos para leitura"
  ON models FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Apenas usuários autenticados podem inserir modelos"
  ON models FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Apenas usuários autenticados podem atualizar modelos"
  ON models FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Apenas usuários autenticados podem deletar modelos"
  ON models FOR DELETE
  USING (auth.role() = 'authenticated');

