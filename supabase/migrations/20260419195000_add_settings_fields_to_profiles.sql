ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS chinese_name TEXT,
  ADD COLUMN IF NOT EXISTS english_name TEXT,
  ADD COLUMN IF NOT EXISTS school TEXT,
  ADD COLUMN IF NOT EXISTS major TEXT,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{
    "preferred_name": "",
    "feedback_style": "balanced",
    "reply_pacing": "realistic",
    "show_beginner_hints": true,
    "show_starter_kit_guidance": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS notifications JSONB NOT NULL DEFAULT '{
    "notify_new_task": true,
    "notify_leader_reply": true,
    "notify_email": true,
    "notify_badges": true,
    "notify_browser": false
  }'::jsonb;
