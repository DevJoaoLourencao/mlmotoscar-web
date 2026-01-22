-- Adicionar campos de logo e favicon na tabela settings
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS logo_light TEXT,
ADD COLUMN IF NOT EXISTS logo_dark TEXT,
ADD COLUMN IF NOT EXISTS favicon TEXT;

-- Comentários descritivos
COMMENT ON COLUMN settings.logo_light IS 'URL da logo para tema claro (fundo claro)';
COMMENT ON COLUMN settings.logo_dark IS 'URL da logo para tema escuro (fundo escuro)';
COMMENT ON COLUMN settings.favicon IS 'URL do favicon do site';

