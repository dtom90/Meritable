-- Add archived flag to exercises (soft-archive; default false = active)
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
