-- Migration: Remover campos transmission e fuel da tabela vehicles
-- Atualizar campo plate_end para aceitar placa completa

-- Remover colunas transmission e fuel
ALTER TABLE vehicles 
  DROP COLUMN IF EXISTS transmission,
  DROP COLUMN IF EXISTS fuel;

-- Atualizar coluna plate_end para aceitar placa completa (até 7 caracteres)
-- Não precisa alterar o tipo, apenas remover a constraint se existir
-- O campo já é TEXT, então aceita qualquer tamanho

