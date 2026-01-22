-- Migration: Adicionar constraint UNIQUE no CPF
-- Impede cadastro de clientes com CPF duplicado
-- Permite múltiplos clientes sem CPF (NULL)

-- 1. Remover constraint existente (se houver)
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_cpf_key;

-- 2. Adicionar constraint UNIQUE no campo CPF
-- Nota: PostgreSQL permite múltiplos NULL em colunas UNIQUE
-- Apenas valores preenchidos precisam ser únicos
ALTER TABLE customers
ADD CONSTRAINT customers_cpf_unique UNIQUE (cpf);

-- Comentários:
-- - CPF duplicado não será permitido
-- - CPF vazio (NULL) pode existir em múltiplos registros
-- - Constraint garante integridade dos dados

