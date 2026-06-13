-- ============================================================
-- NepConnect Database Schema (aligned with existing tables)
-- ============================================================

-- ── EXISTING TABLES (keep as-is) ──

-- Table: profiles (already exists)
-- Columns: id (uuid PK), full_name (text), biz_type (text), phone (text unique)

-- Table: users (already exists)
-- Columns: id (uuid PK), username (text unique), email (text unique),
--          phone_number (text), password_hash (text), email_verified (bool),
--          email_verification_token (text), device_id (text),
--          created_at (timestamptz), updated_at (timestamptz)

-- Table: listings (already exists - NOTE: seller_id is uuid, references users.id)
-- Columns as listed above

-- Table: locations (already exists)
-- Nepal's geographic hierarchy (province, district, municipality)

-- ── NEW TABLES for new features ──

-- ============================================================
-- 1. REVIEWS / RATINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_device_id TEXT,
  reviewer_name TEXT,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);

-- ============================================================
-- 2. FAVORITES / WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE(COALESCE(user_id, '00000000-0000-0000-0000-000000000000'), listing_id)
);

-- More practical unique constraint using a function
CREATE OR REPLACE FUNCTION favorite_unique_constraint() RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM favorites 
    WHERE listing_id = NEW.listing_id 
      AND (user_id = NEW.user_id OR (user_id IS NULL AND NEW.user_id IS NULL))
      AND (device_id = NEW.device_id OR (device_id IS NULL AND NEW.device_id IS NULL))
      AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Duplicate favorite';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_favorite_unique ON favorites;
CREATE TRIGGER trg_favorite_unique BEFORE INSERT ON favorites
  FOR EACH ROW EXECUTE FUNCTION favorite_unique_constraint();

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_device ON favorites(device_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing ON favorites(listing_id);

-- ============================================================
-- 3. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_device ON notifications(device_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;

-- ============================================================
-- 4. CONVERSATIONS (in-app messaging)
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  buyer_device_id TEXT,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(last_message_at DESC);

-- ============================================================
-- 5. MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_device_id TEXT,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);

-- ============================================================
-- 6. MARKET PRICES (static reference data)
-- ============================================================
CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE,
  crop_name TEXT NOT NULL,
  variety TEXT,
  unit TEXT DEFAULT 'kg',
  min_price NUMERIC,
  max_price NUMERIC,
  avg_price NUMERIC,
  market_location TEXT,
  source TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_prices_date ON market_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop ON market_prices(crop_name);

-- ============================================================
-- Optional: Enable Row Level Security
-- ============================================================
-- Uncomment and customize if using Supabase Auth
/*
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust as needed)
CREATE POLICY "Users can see their own reviews" ON reviews
  FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can see their own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can see their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Participants can see conversations" ON conversations
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Participants can see messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );
*/
