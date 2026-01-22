-- ============================================
-- Schema do Banco de Dados MLMOTOSCAR
-- Para Supabase PostgreSQL
-- ============================================

-- Tabela de Marcas (Brands)
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('carro', 'moto')),
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);

-- Tabela de Modelos (Models)
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

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('carro', 'moto')),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE RESTRICT,
  brand TEXT NOT NULL, -- Mantido para compatibilidade e busca
  model TEXT NOT NULL, -- Mantido para compatibilidade e busca
  price NUMERIC(12, 2) NOT NULL,
  year INTEGER NOT NULL,
  mileage INTEGER NOT NULL DEFAULT 0,
  fuel TEXT NOT NULL,
  transmission TEXT NOT NULL,
  color TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  plate_end TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved'))
);

-- Índices para marcas
CREATE INDEX IF NOT EXISTS idx_brands_type ON brands(type);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(active);
CREATE INDEX IF NOT EXISTS idx_brands_order ON brands(order_index);

-- Índices para modelos
CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_type ON models(type);
CREATE INDEX IF NOT EXISTS idx_models_active ON models(active);
CREATE INDEX IF NOT EXISTS idx_models_order ON models(order_index);

-- Índices para veículos
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_id ON vehicles(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_model_id ON vehicles(model_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at DESC);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT,
  city TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'cliente', 'arquivado'))
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_title TEXT NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  payment JSONB NOT NULL, -- Armazena PaymentDetails como JSON
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'canceled')),
  notes TEXT
);

-- Índices para vendas
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_id ON sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);

-- Tabela de Histórico de Pagamentos
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount NUMERIC(12, 2) NOT NULL,
  note TEXT,
  type TEXT NOT NULL CHECK (type IN ('installment', 'settlement'))
);

-- Índices para histórico de pagamentos
CREATE INDEX IF NOT EXISTS idx_payment_history_sale_id ON payment_history(sale_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(date);

-- Tabela de Configurações (apenas uma linha)
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  store_name TEXT NOT NULL DEFAULT 'MLMOTOSCAR',
  primary_color TEXT NOT NULL DEFAULT '#ff0000',
  secondary_color TEXT NOT NULL DEFAULT '#1f2937',
  whatsapp_color TEXT DEFAULT '#25D366',
  navbar_color TEXT,
  sidebar_color TEXT,
  phone_primary TEXT NOT NULL,
  phone_secondary TEXT NOT NULL,
  email_contact TEXT NOT NULL,
  address TEXT NOT NULL,
  opening_hours_weekdays TEXT NOT NULL,
  opening_hours_weekend TEXT NOT NULL,
  google_maps_url TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  default_theme TEXT DEFAULT 'dark' CHECK (default_theme IN ('dark', 'light')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at na tabela settings
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão se não existirem
INSERT INTO settings (id) 
VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Políticas para vehicles (público pode ler, apenas autenticados podem escrever)
CREATE POLICY "Vehicles são públicos para leitura"
  ON vehicles FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir veículos"
  ON vehicles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar veículos"
  ON vehicles FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem deletar veículos"
  ON vehicles FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para customers (apenas autenticados)
CREATE POLICY "Apenas usuários autenticados podem ver clientes"
  ON customers FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem inserir clientes"
  ON customers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar clientes"
  ON customers FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem deletar clientes"
  ON customers FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para sales (apenas autenticados)
CREATE POLICY "Apenas usuários autenticados podem ver vendas"
  ON sales FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem inserir vendas"
  ON sales FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar vendas"
  ON sales FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem deletar vendas"
  ON sales FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para payment_history (apenas autenticados)
CREATE POLICY "Apenas usuários autenticados podem ver histórico de pagamentos"
  ON payment_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem inserir histórico de pagamentos"
  ON payment_history FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar histórico de pagamentos"
  ON payment_history FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem deletar histórico de pagamentos"
  ON payment_history FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para settings (público pode ler, apenas autenticados podem escrever)
CREATE POLICY "Settings são públicos para leitura"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem atualizar configurações"
  ON settings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem inserir configurações"
  ON settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Políticas para brands (público pode ler, apenas autenticados podem escrever)
CREATE POLICY "Brands são públicos para leitura"
  ON brands FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir marcas"
  ON brands FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar marcas"
  ON brands FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem deletar marcas"
  ON brands FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas para models (público pode ler, apenas autenticados podem escrever)
CREATE POLICY "Models são públicos para leitura"
  ON models FOR SELECT
  USING (true);

CREATE POLICY "Apenas usuários autenticados podem inserir modelos"
  ON models FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem atualizar modelos"
  ON models FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Apenas usuários autenticados podem deletar modelos"
  ON models FOR DELETE
  USING (auth.role() = 'authenticated');

