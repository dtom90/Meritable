-- Add archived flag to habits (soft-archive; default false = active)
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
