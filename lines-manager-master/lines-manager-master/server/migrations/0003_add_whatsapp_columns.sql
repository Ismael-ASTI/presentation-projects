-- Migration: add WhatsApp columns to lines
ALTER TABLE lines
  ADD COLUMN IF NOT EXISTS has_whatsapp boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_number varchar(20);
