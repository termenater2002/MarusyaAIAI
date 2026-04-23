CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  source_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tools (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  short_description TEXT NOT NULL,
  long_description TEXT,
  works_in_russia BOOLEAN,
  needs_vpn BOOLEAN,
  requires_registration BOOLEAN,
  is_free BOOLEAN,
  editorial_rating NUMERIC(3,1),
  source_dataset TEXT NOT NULL DEFAULT 'AIDATASET_deduped_items.json',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tool_categories (
  tool_id INTEGER NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tool_id, category_id)
);

CREATE TABLE IF NOT EXISTS tags (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_tool_tags (
  tool_id INTEGER NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL REFERENCES tags(name) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tool_id, tag_name)
);

CREATE TABLE IF NOT EXISTS ai_tool_features (
  tool_id INTEGER NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  position_index INTEGER NOT NULL,
  feature_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (tool_id, position_index)
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'pending_verification')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_favorites (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id INTEGER NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tool_id)
);

CREATE TABLE IF NOT EXISTS user_ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id INTEGER NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 10),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, tool_id)
);

CREATE TABLE IF NOT EXISTS service_check_runs (
  id TEXT PRIMARY KEY,
  source_file TEXT NOT NULL,
  checked_at TIMESTAMPTZ NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_count INTEGER NOT NULL,
  ok_count INTEGER NOT NULL,
  failed_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS service_check_results (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES service_check_runs(id) ON DELETE CASCADE,
  tool_id INTEGER REFERENCES ai_tools(id) ON DELETE SET NULL,
  source_index INTEGER NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT,
  url TEXT NOT NULL,
  ok BOOLEAN NOT NULL,
  status INTEGER,
  final_url TEXT,
  redirected BOOLEAN NOT NULL DEFAULT FALSE,
  response_time_ms INTEGER,
  error TEXT,
  checked_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_tool_search_index (
  tool_id INTEGER PRIMARY KEY REFERENCES ai_tools(id) ON DELETE CASCADE,
  name_text TEXT NOT NULL,
  entity_type_text TEXT NOT NULL,
  description_text TEXT,
  long_description_text TEXT,
  tags_text TEXT,
  features_text TEXT,
  categories_text TEXT,
  searchable_text TEXT NOT NULL,
  embedding_model TEXT,
  embedding JSONB,
  embedding_updated_at TIMESTAMPTZ,
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', COALESCE(name_text, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(tags_text, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(features_text, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(description_text, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(categories_text, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(long_description_text, '')), 'C') ||
    setweight(to_tsvector('simple', COALESCE(entity_type_text, '')), 'C')
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_entity_type ON ai_tools(entity_type);
CREATE INDEX IF NOT EXISTS idx_ai_tools_editorial_rating ON ai_tools(editorial_rating);
CREATE INDEX IF NOT EXISTS idx_ai_tool_categories_category_id ON ai_tool_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_ai_tool_tags_tag_name ON ai_tool_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_user_favorites_tool_id ON user_favorites(tool_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_tool_id ON user_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_service_check_results_run_id ON service_check_results(run_id);
CREATE INDEX IF NOT EXISTS idx_service_check_results_tool_id ON service_check_results(tool_id);
CREATE INDEX IF NOT EXISTS idx_service_check_results_checked_at ON service_check_results(checked_at);
CREATE INDEX IF NOT EXISTS idx_ai_tool_search_index_search_vector ON ai_tool_search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_ai_tool_search_index_embedding_model ON ai_tool_search_index(embedding_model);
