-- Add order column to tags for user-defined ordering
ALTER TABLE public.tags ADD COLUMN IF NOT EXISTS "order" integer NOT NULL DEFAULT 0;

-- Backfill existing rows: assign order by id per user
UPDATE public.tags t
SET "order" = sub.rn - 1
FROM (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY id) AS rn
  FROM public.tags
) sub
WHERE t.id = sub.id;
