-- Social Media Integration System
-- Adds social account management, metrics tracking, and unified inbox functionality

-- 1) Accounts connected per talent
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
  platform TEXT CHECK (platform IN ('instagram','facebook','youtube','x','threads','tiktok','website')) NOT NULL,
  handle TEXT,
  external_id TEXT,
  page_name TEXT,
  website_url TEXT,
  is_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) OAuth tokens (server-side only)
CREATE TABLE IF NOT EXISTS social_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  token_type TEXT,
  scope TEXT,
  expires_at TIMESTAMPTZ
);

-- 3) Daily metrics snapshot
CREATE TABLE IF NOT EXISTS social_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  date DATE,
  followers INT,
  following INT,
  posts INT,
  views BIGINT,
  likes BIGINT,
  comments BIGINT,
  shares BIGINT,
  engagement_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_smd_account_date ON social_metrics_daily(account_id, date);

-- 4) Tracked posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_post_id TEXT NOT NULL,
  url TEXT,
  title TEXT,
  media_type TEXT,
  published_at TIMESTAMPTZ,
  like_count INT,
  comment_count INT,
  share_count INT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, external_post_id)
);

-- 5) Comments
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  external_comment_id TEXT NOT NULL,
  parent_external_id TEXT,
  author_name TEXT,
  author_handle TEXT,
  author_external_id TEXT,
  body TEXT,
  like_count INT,
  is_reply BOOLEAN DEFAULT false,
  created_at_platform TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, external_comment_id)
);

-- 6) Outgoing replies
CREATE TABLE IF NOT EXISTS social_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES social_comments(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  reply_body TEXT NOT NULL,
  status TEXT CHECK (status IN ('queued','sent','failed')) DEFAULT 'queued',
  external_reply_id TEXT,
  error TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- 7) External web mentions (RSS/news)
CREATE TABLE IF NOT EXISTS web_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID REFERENCES talents(id) ON DELETE CASCADE,
  source TEXT,
  title TEXT,
  url TEXT,
  published_at TIMESTAMPTZ,
  snippet TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(talent_id, url)
);
