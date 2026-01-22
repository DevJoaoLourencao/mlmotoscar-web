-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  store_name TEXT NOT NULL DEFAULT 'MLMOTOSCAR',
  primary_color TEXT NOT NULL DEFAULT '#ff0000',
  secondary_color TEXT NOT NULL DEFAULT '#1f2937',
  whatsapp_color TEXT DEFAULT '#25D366',
  navbar_color TEXT,
  sidebar_color TEXT,
  phone_primary TEXT NOT NULL DEFAULT '(14) 99703-6375',
  phone_primary_name TEXT NOT NULL DEFAULT 'Wagner Lourenção',
  phone_secondary TEXT NOT NULL DEFAULT '(14) 99156-9560',
  phone_secondary_name TEXT NOT NULL DEFAULT 'João Lourenção',
  email_contact TEXT NOT NULL DEFAULT 'vendas@mlmotoscar.com.br',
  address TEXT NOT NULL DEFAULT 'Av. Brasil, 1500 - Jardins, São Paulo - SP',
  opening_hours_weekdays TEXT NOT NULL DEFAULT 'Seg - Sex: 09h às 18h',
  opening_hours_weekend TEXT NOT NULL DEFAULT 'Sáb: 09h às 13h',
  google_maps_url TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  default_theme TEXT NOT NULL DEFAULT 'dark' CHECK (default_theme IN ('dark', 'light')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura pública
CREATE POLICY "Permitir leitura pública de configurações"
  ON settings
  FOR SELECT
  TO public
  USING (true);

-- Política para permitir atualização autenticada
CREATE POLICY "Permitir atualização de configurações para usuários autenticados"
  ON settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inserir configurações padrão
INSERT INTO settings (id) VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

