const httpError = require("../utils/httpError");

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  return [];
}

function normalizeLikedBy(value) {
  return parseJsonArray(value).map((entry) => ({
    id: Number.parseInt(entry.id, 10),
    name: entry.name,
  }));
}

function mapPostRow(row) {
  return {
    id: Number.parseInt(row.id, 10),
    content: row.content,
    imageUrl: row.image_url,
    visibility: row.visibility,
    createdAt: new Date(row.created_at).toISOString(),
    author: {
      id: Number.parseInt(row.user_id, 10),
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}`.trim(),
    },
    likes: {
      count: Number.parseInt(row.like_count, 10),
      likedByViewer: row.liked_by_viewer,
      likedBy: normalizeLikedBy(row.liked_by),
    },
    commentCount: Number.parseInt(row.comment_count, 10),
    comments: [],
  };
}

function mapCommentRow(row) {
  return {
    id: Number.parseInt(row.id, 10),
    postId: Number.parseInt(row.post_id, 10),
    parentCommentId: row.parent_comment_id
      ? Number.parseInt(row.parent_comment_id, 10)
      : null,
    content: row.body,
    createdAt: new Date(row.created_at).toISOString(),
    author: {
      id: Number.parseInt(row.user_id, 10),
      firstName: row.first_name,
      lastName: row.last_name,
      fullName: `${row.first_name} ${row.last_name}`.trim(),
    },
    likes: {
      count: Number.parseInt(row.like_count, 10),
      likedByViewer: row.liked_by_viewer,
      likedBy: normalizeLikedBy(row.liked_by),
    },
    replies: [],
  };
}

const postSelect = `
  SELECT
    p.id,
    p.user_id,
    p.content,
    p.image_url,
    p.visibility,
    p.created_at,
    u.first_name,
    u.last_name,
    EXISTS (
      SELECT 1
      FROM post_likes pl
      WHERE pl.post_id = p.id AND pl.user_id = $1
    ) AS liked_by_viewer,
    (
      SELECT COUNT(*)::int
      FROM post_likes pl
      WHERE pl.post_id = p.id
    ) AS like_count,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object('id', lu.id, 'name', lu.first_name || ' ' || lu.last_name)
          ORDER BY likes.created_at DESC
        )
        FROM (
          SELECT pl2.user_id, pl2.created_at
          FROM post_likes pl2
          WHERE pl2.post_id = p.id
          ORDER BY pl2.created_at DESC
          LIMIT 10
        ) likes
        JOIN users lu ON lu.id = likes.user_id
      ),
      '[]'::json
    ) AS liked_by,
    (
      SELECT COUNT(*)::int
      FROM comments c2
      WHERE c2.post_id = p.id
    ) AS comment_count
  FROM posts p
  JOIN users u ON u.id = p.user_id
`;

const commentSelect = `
  SELECT
    c.id,
    c.post_id,
    c.parent_comment_id,
    c.body,
    c.created_at,
    c.user_id,
    u.first_name,
    u.last_name,
    EXISTS (
      SELECT 1
      FROM comment_likes cl
      WHERE cl.comment_id = c.id AND cl.user_id = $2
    ) AS liked_by_viewer,
    (
      SELECT COUNT(*)::int
      FROM comment_likes cl
      WHERE cl.comment_id = c.id
    ) AS like_count,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object('id', lu.id, 'name', lu.first_name || ' ' || lu.last_name)
          ORDER BY likes.created_at DESC
        )
        FROM (
          SELECT cl2.user_id, cl2.created_at
          FROM comment_likes cl2
          WHERE cl2.comment_id = c.id
          ORDER BY cl2.created_at DESC
          LIMIT 10
        ) likes
        JOIN users lu ON lu.id = likes.user_id
      ),
      '[]'::json
    ) AS liked_by
  FROM comments c
  JOIN users u ON u.id = c.user_id
  WHERE c.post_id = ANY($1::bigint[])
  ORDER BY c.created_at ASC, c.id ASC
`;

async function fetchCommentsByPostIds(client, postIds, viewerId) {
  const postCommentsMap = new Map(postIds.map((postId) => [postId, []]));
  if (postIds.length === 0) return postCommentsMap;

  const { rows } = await client.query(commentSelect, [postIds, viewerId]);
  const commentsById = new Map();

  for (const row of rows) {
    const comment = mapCommentRow(row);
    commentsById.set(comment.id, comment);
  }

  for (const comment of commentsById.values()) {
    if (comment.parentCommentId && commentsById.has(comment.parentCommentId)) {
      commentsById.get(comment.parentCommentId).replies.push(comment);
      continue;
    }

    if (postCommentsMap.has(comment.postId)) {
      postCommentsMap.get(comment.postId).push(comment);
    }
  }

  return postCommentsMap;
}

async function getPostsForFeed(client, viewerId, options) {
  const limit = Math.min(Math.max(options.limit || 10, 1), 30);
  const cursorCreatedAt = options.cursorCreatedAt || null;
  const cursorId = options.cursorId || null;

  const { rows } = await client.query(
    `
      ${postSelect}
      WHERE (p.visibility = 'public' OR p.user_id = $1)
        AND (
          $2::timestamptz IS NULL
          OR (p.created_at, p.id) < ($2::timestamptz, $3::bigint)
        )
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT $4
    `,
    [viewerId, cursorCreatedAt, cursorId, limit + 1],
  );

  const hasNextPage = rows.length > limit;
  const selectedRows = hasNextPage ? rows.slice(0, limit) : rows;
  const posts = selectedRows.map(mapPostRow);
  const postIds = posts.map((post) => post.id);

  const commentsByPostIds = await fetchCommentsByPostIds(client, postIds, viewerId);
  for (const post of posts) {
    post.comments = commentsByPostIds.get(post.id) || [];
  }

  const nextCursor = hasNextPage
    ? {
        createdAt: posts[posts.length - 1].createdAt,
        id: posts[posts.length - 1].id,
      }
    : null;

  return { posts, nextCursor };
}

async function getPostsByIds(client, viewerId, postIds) {
  if (postIds.length === 0) return [];

  const { rows } = await client.query(
    `
      ${postSelect}
      WHERE p.id = ANY($2::bigint[])
        AND (p.visibility = 'public' OR p.user_id = $1)
      ORDER BY p.created_at DESC, p.id DESC
    `,
    [viewerId, postIds],
  );

  const posts = rows.map(mapPostRow);
  const commentsByPostIds = await fetchCommentsByPostIds(
    client,
    posts.map((post) => post.id),
    viewerId,
  );

  for (const post of posts) {
    post.comments = commentsByPostIds.get(post.id) || [];
  }

  return posts;
}

async function assertPostReadable(client, postId, viewerId) {
  const { rows } = await client.query(
    `
      SELECT id, user_id, visibility
      FROM posts
      WHERE id = $1
    `,
    [postId],
  );

  if (rows.length === 0) {
    throw httpError(404, "Post not found");
  }

  const post = rows[0];
  if (post.visibility === "private" && Number.parseInt(post.user_id, 10) !== viewerId) {
    throw httpError(403, "You do not have access to this post");
  }
}

async function createPost(client, input) {
  const { rows } = await client.query(
    `
      INSERT INTO posts (user_id, content, image_url, visibility)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [input.userId, input.content, input.imageUrl || null, input.visibility],
  );

  return Number.parseInt(rows[0].id, 10);
}

async function getPostLikeSummary(client, postId, viewerId) {
  const { rows } = await client.query(
    `
      SELECT
        EXISTS (
          SELECT 1
          FROM post_likes pl
          WHERE pl.post_id = $1 AND pl.user_id = $2
        ) AS liked_by_viewer,
        (
          SELECT COUNT(*)::int
          FROM post_likes pl
          WHERE pl.post_id = $1
        ) AS like_count,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object('id', lu.id, 'name', lu.first_name || ' ' || lu.last_name)
              ORDER BY likes.created_at DESC
            )
            FROM (
              SELECT pl2.user_id, pl2.created_at
              FROM post_likes pl2
              WHERE pl2.post_id = $1
              ORDER BY pl2.created_at DESC
              LIMIT 10
            ) likes
            JOIN users lu ON lu.id = likes.user_id
          ),
          '[]'::json
        ) AS liked_by
    `,
    [postId, viewerId],
  );

  return {
    count: Number.parseInt(rows[0].like_count, 10),
    likedByViewer: rows[0].liked_by_viewer,
    likedBy: normalizeLikedBy(rows[0].liked_by),
  };
}

async function togglePostLike(client, postId, viewerId) {
  await assertPostReadable(client, postId, viewerId);

  await client.query(
    `
      WITH removed AS (
        DELETE FROM post_likes
        WHERE post_id = $1 AND user_id = $2
        RETURNING 1
      )
      INSERT INTO post_likes (post_id, user_id)
      SELECT $1, $2
      WHERE NOT EXISTS (SELECT 1 FROM removed)
    `,
    [postId, viewerId],
  );

  return getPostLikeSummary(client, postId, viewerId);
}

async function assertCommentReadable(client, commentId, viewerId) {
  const { rows } = await client.query(
    `
      SELECT
        c.id,
        c.post_id,
        p.user_id AS post_owner_id,
        p.visibility AS post_visibility
      FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.id = $1
    `,
    [commentId],
  );

  if (rows.length === 0) {
    throw httpError(404, "Comment not found");
  }

  const comment = rows[0];
  if (
    comment.post_visibility === "private" &&
    Number.parseInt(comment.post_owner_id, 10) !== viewerId
  ) {
    throw httpError(403, "You do not have access to this comment");
  }

  return {
    commentId: Number.parseInt(comment.id, 10),
    postId: Number.parseInt(comment.post_id, 10),
  };
}

async function getCommentLikeSummary(client, commentId, viewerId) {
  const { rows } = await client.query(
    `
      SELECT
        EXISTS (
          SELECT 1
          FROM comment_likes cl
          WHERE cl.comment_id = $1 AND cl.user_id = $2
        ) AS liked_by_viewer,
        (
          SELECT COUNT(*)::int
          FROM comment_likes cl
          WHERE cl.comment_id = $1
        ) AS like_count,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object('id', lu.id, 'name', lu.first_name || ' ' || lu.last_name)
              ORDER BY likes.created_at DESC
            )
            FROM (
              SELECT cl2.user_id, cl2.created_at
              FROM comment_likes cl2
              WHERE cl2.comment_id = $1
              ORDER BY cl2.created_at DESC
              LIMIT 10
            ) likes
            JOIN users lu ON lu.id = likes.user_id
          ),
          '[]'::json
        ) AS liked_by
    `,
    [commentId, viewerId],
  );

  return {
    count: Number.parseInt(rows[0].like_count, 10),
    likedByViewer: rows[0].liked_by_viewer,
    likedBy: normalizeLikedBy(rows[0].liked_by),
  };
}

async function toggleCommentLike(client, commentId, viewerId) {
  await assertCommentReadable(client, commentId, viewerId);

  await client.query(
    `
      WITH removed AS (
        DELETE FROM comment_likes
        WHERE comment_id = $1 AND user_id = $2
        RETURNING 1
      )
      INSERT INTO comment_likes (comment_id, user_id)
      SELECT $1, $2
      WHERE NOT EXISTS (SELECT 1 FROM removed)
    `,
    [commentId, viewerId],
  );

  return getCommentLikeSummary(client, commentId, viewerId);
}

async function createComment(client, input) {
  const { postId, viewerId, content, parentCommentId } = input;

  await assertPostReadable(client, postId, viewerId);

  if (parentCommentId) {
    const parentResult = await client.query(
      `
        SELECT id
        FROM comments
        WHERE id = $1 AND post_id = $2
      `,
      [parentCommentId, postId],
    );

    if (parentResult.rows.length === 0) {
      throw httpError(400, "Reply target does not exist in this post");
    }
  }

  const { rows } = await client.query(
    `
      INSERT INTO comments (post_id, user_id, parent_comment_id, body)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [postId, viewerId, parentCommentId || null, content],
  );

  const commentId = Number.parseInt(rows[0].id, 10);
  const { rows: commentRows } = await client.query(
    `
      SELECT
        c.id,
        c.post_id,
        c.parent_comment_id,
        c.body,
        c.created_at,
        c.user_id,
        u.first_name,
        u.last_name,
        FALSE AS liked_by_viewer,
        0 AS like_count,
        '[]'::json AS liked_by
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = $1
    `,
    [commentId],
  );

  const comment = mapCommentRow(commentRows[0]);
  comment.replies = [];
  return comment;
}

module.exports = {
  getPostsForFeed,
  getPostsByIds,
  createPost,
  togglePostLike,
  createComment,
  toggleCommentLike,
};

