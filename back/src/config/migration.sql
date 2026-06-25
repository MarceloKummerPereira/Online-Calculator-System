-- Migration: adiciona campos de perfil e tipo de usuário
-- Usa ADD COLUMN IF NOT EXISTS para não apagar dados existentes

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS instituicao  varchar(200),
    ADD COLUMN IF NOT EXISTS escolaridade varchar(100),
    ADD COLUMN IF NOT EXISTS endereco     text,
    ADD COLUMN IF NOT EXISTS tipo_usuario varchar(20) DEFAULT 'gratuito' NOT NULL;
