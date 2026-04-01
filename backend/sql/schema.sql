CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
  image_url TEXT,
  visibility VARCHAR(7) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  comment_count INTEGER NOT NULL DEFAULT 0 CHECK (comment_count >= 0),
  top_level_comment_count INTEGER NOT NULL DEFAULT 0 CHECK (top_level_comment_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS top_level_comment_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT,
  image_url TEXT,
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  reply_count INTEGER NOT NULL DEFAULT 0 CHECK (reply_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comments
ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE comments
ADD COLUMN IF NOT EXISTS reply_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE comments
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE comments
ALTER COLUMN body DROP NOT NULL;

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_body_check;

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_body_or_image_check;

ALTER TABLE comments
ADD CONSTRAINT comments_body_or_image_check
CHECK (
  (body IS NOT NULL AND char_length(trim(body)) > 0)
  OR image_url IS NOT NULL
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(10) NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id BIGINT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(10) NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

ALTER TABLE post_likes
ADD COLUMN IF NOT EXISTS reaction_type VARCHAR(10) NOT NULL DEFAULT 'like';

ALTER TABLE post_likes
DROP CONSTRAINT IF EXISTS post_likes_reaction_type_check;

ALTER TABLE post_likes
ADD CONSTRAINT post_likes_reaction_type_check
CHECK (reaction_type IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'));

ALTER TABLE comment_likes
ADD COLUMN IF NOT EXISTS reaction_type VARCHAR(10) NOT NULL DEFAULT 'like';

ALTER TABLE comment_likes
DROP CONSTRAINT IF EXISTS comment_likes_reaction_type_check;

ALTER TABLE comment_likes
ADD CONSTRAINT comment_likes_reaction_type_check
CHECK (reaction_type IN ('like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'));

UPDATE posts p
SET like_count = likes.count
FROM (
  SELECT post_id, COUNT(*)::int AS count
  FROM post_likes
  GROUP BY post_id
) likes
WHERE p.id = likes.post_id;

UPDATE posts
SET like_count = 0
WHERE like_count IS NULL;

UPDATE posts p
SET comment_count = comments.count
FROM (
  SELECT post_id, COUNT(*)::int AS count
  FROM comments
  GROUP BY post_id
) comments
WHERE p.id = comments.post_id;

UPDATE posts
SET comment_count = 0
WHERE comment_count IS NULL;

UPDATE posts p
SET top_level_comment_count = top.count
FROM (
  SELECT post_id, COUNT(*)::int AS count
  FROM comments
  WHERE parent_comment_id IS NULL
  GROUP BY post_id
) top
WHERE p.id = top.post_id;

UPDATE posts
SET top_level_comment_count = 0
WHERE top_level_comment_count IS NULL;

UPDATE comments c
SET like_count = likes.count
FROM (
  SELECT comment_id, COUNT(*)::int AS count
  FROM comment_likes
  GROUP BY comment_id
) likes
WHERE c.id = likes.comment_id;

UPDATE comments
SET like_count = 0
WHERE like_count IS NULL;

UPDATE comments c
SET reply_count = replies.count
FROM (
  SELECT parent_comment_id, COUNT(*)::int AS count
  FROM comments
  WHERE parent_comment_id IS NOT NULL
  GROUP BY parent_comment_id
) replies
WHERE c.id = replies.parent_comment_id;

UPDATE comments
SET reply_count = 0
WHERE reply_count IS NULL;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS posts_set_updated_at ON posts;
CREATE TRIGGER posts_set_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS comments_set_updated_at ON comments;
CREATE TRIGGER comments_set_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_posts_feed_order ON posts(created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_owner_order ON posts(user_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_posts_public_order ON posts(created_at DESC, id DESC) WHERE visibility = 'public';
CREATE INDEX IF NOT EXISTS idx_comments_post_order ON comments(post_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_order ON comments(parent_comment_id, created_at ASC, id ASC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_created ON post_likes(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_created ON post_likes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_reaction ON post_likes(post_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_created ON comment_likes(comment_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_created ON comment_likes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_reaction ON comment_likes(comment_id, reaction_type);

