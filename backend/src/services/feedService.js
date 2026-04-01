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
    topLevelCommentCount: Number.parseInt(row.top_level_comment_count || 0, 10),
    commentPagination: null,
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
    imageUrl: row.image_url,
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
    replyCount: Number.parseInt(row.reply_count || 0, 10),
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
    p.like_count,
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
    p.comment_count,
    p.top_level_comment_count
  FROM posts p
  JOIN users u ON u.id = p.user_id
`;

const commentSelect = `
  SELECT
    c.id,
    c.post_id,
    c.parent_comment_id,
    c.body,
    c.image_url,
    c.created_at,
    c.user_id,
    u.first_name,
    u.last_name,
    EXISTS (
      SELECT 1
      FROM comment_likes cl
      WHERE cl.comment_id = c.id AND cl.user_id = $2
    ) AS liked_by_viewer,
    c.like_count,
    c.reply_count,
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

function buildCommentsByPostIds(postIds, rows) {
  const postCommentsMap = new Map(postIds.map((postId) => [postId, []]));
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

async function fetchCommentThreadsByRootIds(client, rootIds, viewerId, scopedPostIds) {
  const postIds = scopedPostIds || [];
  const postCommentsMap = new Map(postIds.map((postId) => [postId, []]));
  if (rootIds.length === 0) return postCommentsMap;

  const { rows } = await client.query(
    `
      WITH RECURSIVE thread AS (
        SELECT
          c.id,
          c.post_id,
          c.parent_comment_id,
          c.body,
          c.image_url,
          c.created_at,
          c.user_id,
          c.like_count,
          c.reply_count
        FROM comments c
        WHERE c.id = ANY($1::bigint[])

        UNION ALL

        SELECT
          child.id,
          child.post_id,
          child.parent_comment_id,
          child.body,
          child.image_url,
          child.created_at,
          child.user_id,
          child.like_count,
          child.reply_count
        FROM comments child
        JOIN thread t ON t.id = child.parent_comment_id
      )
      SELECT
        c.id,
        c.post_id,
        c.parent_comment_id,
        c.body,
        c.image_url,
        c.created_at,
        c.user_id,
        u.first_name,
        u.last_name,
        EXISTS (
          SELECT 1
          FROM comment_likes cl
          WHERE cl.comment_id = c.id AND cl.user_id = $2
        ) AS liked_by_viewer,
        c.like_count,
        c.reply_count,
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
      FROM thread c
      JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at ASC, c.id ASC
    `,
    [rootIds, viewerId],
  );

  const inferredPostIds = postIds.length > 0
    ? postIds
    : [...new Set(rows.map((row) => Number.parseInt(row.post_id, 10)))];
  return buildCommentsByPostIds(inferredPostIds, rows);
}

async function fetchInitialCommentThreadsByPostIds(client, postIds, viewerId, perPostLimit) {
  const commentsByPostIds = new Map(postIds.map((postId) => [postId, []]));
  const pageMetaByPostIds = new Map(
    postIds.map((postId) => [postId, { loadedCount: 0, nextCursor: null }]),
  );

  if (postIds.length === 0) {
    return { commentsByPostIds, pageMetaByPostIds };
  }

  const { rows: rootRows } = await client.query(
    `
      SELECT ranked.post_id, ranked.id, ranked.created_at
      FROM (
        SELECT
          c.post_id,
          c.id,
          c.created_at,
          ROW_NUMBER() OVER (
            PARTITION BY c.post_id
            ORDER BY c.created_at DESC, c.id DESC
          ) AS rn
        FROM comments c
        WHERE c.post_id = ANY($1::bigint[])
          AND c.parent_comment_id IS NULL
      ) ranked
      WHERE ranked.rn <= $2
      ORDER BY ranked.post_id ASC, ranked.created_at DESC, ranked.id DESC
    `,
    [postIds, perPostLimit],
  );

  const rootIds = rootRows.map((row) => Number.parseInt(row.id, 10));
  const rootsByPostId = new Map();

  for (const row of rootRows) {
    const postId = Number.parseInt(row.post_id, 10);
    if (!rootsByPostId.has(postId)) {
      rootsByPostId.set(postId, []);
    }

    rootsByPostId.get(postId).push({
      id: Number.parseInt(row.id, 10),
      createdAt: new Date(row.created_at).toISOString(),
    });
  }

  const fetchedComments = await fetchCommentThreadsByRootIds(client, rootIds, viewerId, postIds);
  for (const [postId, comments] of fetchedComments.entries()) {
    commentsByPostIds.set(postId, comments);
  }

  for (const postId of postIds) {
    const roots = rootsByPostId.get(postId) || [];
    const oldestLoadedRoot = roots.length > 0 ? roots[roots.length - 1] : null;
    pageMetaByPostIds.set(postId, {
      loadedCount: roots.length,
      nextCursor: oldestLoadedRoot
        ? {
            createdAt: oldestLoadedRoot.createdAt,
            id: oldestLoadedRoot.id,
          }
        : null,
    });
  }

  return { commentsByPostIds, pageMetaByPostIds };
}

async function getTopLevelCommentsForPost(client, viewerId, postId, options = {}) {
  await assertPostReadable(client, postId, viewerId);

  const limit = Math.min(Math.max(options.limit || 10, 1), 50);
  const cursorCreatedAt = options.cursorCreatedAt || null;
  const cursorId = options.cursorId || null;

  const { rows: rootRows } = await client.query(
    `
      SELECT c.id, c.post_id, c.created_at
      FROM comments c
      WHERE c.post_id = $1
        AND c.parent_comment_id IS NULL
        AND (
          $2::timestamptz IS NULL
          OR (c.created_at, c.id) < ($2::timestamptz, $3::bigint)
        )
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT $4
    `,
    [postId, cursorCreatedAt, cursorId, limit + 1],
  );

  const hasMore = rootRows.length > limit;
  const selectedRoots = hasMore ? rootRows.slice(0, limit) : rootRows;
  const rootIds = selectedRoots.map((row) => Number.parseInt(row.id, 10));

  const commentsByPostIds = await fetchCommentThreadsByRootIds(client, rootIds, viewerId, [postId]);
  const comments = commentsByPostIds.get(postId) || [];

  const nextCursor = hasMore && selectedRoots.length > 0
    ? {
        createdAt: new Date(selectedRoots[selectedRoots.length - 1].created_at).toISOString(),
        id: Number.parseInt(selectedRoots[selectedRoots.length - 1].id, 10),
      }
    : null;

  const { rows: totalRows } = await client.query(
    `
      SELECT top_level_comment_count::int AS total
      FROM posts
      WHERE id = $1
    `,
    [postId],
  );

  return {
    comments,
    hasMore,
    nextCursor,
    totalCount: Number.parseInt(totalRows[0].total, 10),
  };
}

async function getPostsForFeed(client, viewerId, options) {
  const limit = Math.min(Math.max(options.limit || 10, 1), 30);
  const cursorCreatedAt = options.cursorCreatedAt || null;
  const cursorId = options.cursorId || null;
  const commentPreviewLimit = Math.min(Math.max(options.commentPreviewLimit || 2, 1), 10);

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

  const { commentsByPostIds, pageMetaByPostIds } = await fetchInitialCommentThreadsByPostIds(
    client,
    postIds,
    viewerId,
    commentPreviewLimit,
  );

  for (const post of posts) {
    post.comments = commentsByPostIds.get(post.id) || [];
    const pageMeta = pageMetaByPostIds.get(post.id) || {
      loadedCount: 0,
      nextCursor: null,
    };
    const hasMoreTopLevelComments = post.topLevelCommentCount > pageMeta.loadedCount;
    post.commentPagination = {
      hasMore: hasMoreTopLevelComments,
      nextCursor: hasMoreTopLevelComments ? pageMeta.nextCursor : null,
      pageSize: commentPreviewLimit,
    };
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
  const { commentsByPostIds, pageMetaByPostIds } = await fetchInitialCommentThreadsByPostIds(
    client,
    posts.map((post) => post.id),
    viewerId,
    2,
  );

  for (const post of posts) {
    post.comments = commentsByPostIds.get(post.id) || [];
    const pageMeta = pageMetaByPostIds.get(post.id) || {
      loadedCount: 0,
      nextCursor: null,
    };
    const hasMoreTopLevelComments = post.topLevelCommentCount > pageMeta.loadedCount;
    post.commentPagination = {
      hasMore: hasMoreTopLevelComments,
      nextCursor: hasMoreTopLevelComments ? pageMeta.nextCursor : null,
      pageSize: 2,
    };
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
        p.like_count,
        EXISTS (
          SELECT 1
          FROM post_likes pl
          WHERE pl.post_id = $1 AND pl.user_id = $2
        ) AS liked_by_viewer,
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
      FROM posts p
      WHERE p.id = $1
    `,
    [postId, viewerId],
  );

  return {
    count: Number.parseInt(rows[0].like_count, 10),
    likedByViewer: rows[0].liked_by_viewer,
    likedBy: normalizeLikedBy(rows[0].liked_by),
  };
}

async function getPostReactions(client, viewerId, postId) {
  await assertPostReadable(client, postId, viewerId);

  const { rows } = await client.query(
    `
      SELECT
        pl.user_id,
        pl.created_at,
        u.first_name,
        u.last_name
      FROM post_likes pl
      JOIN users u ON u.id = pl.user_id
      WHERE pl.post_id = $1
      ORDER BY pl.created_at DESC
    `,
    [postId],
  );

  return {
    totalCount: rows.length,
    reactions: rows.map((row) => ({
      userId: Number.parseInt(row.user_id, 10),
      fullName: `${row.first_name} ${row.last_name}`.trim(),
      reactionType: "like",
      createdAt: new Date(row.created_at).toISOString(),
    })),
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
      ),
      inserted AS (
        INSERT INTO post_likes (post_id, user_id)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM removed)
        RETURNING 1
      )
      UPDATE posts p
      SET like_count = GREATEST(
        0,
        p.like_count + CASE WHEN EXISTS (SELECT 1 FROM inserted) THEN 1 ELSE -1 END
      )
      WHERE p.id = $1
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
        c.like_count,
        EXISTS (
          SELECT 1
          FROM comment_likes cl
          WHERE cl.comment_id = $1 AND cl.user_id = $2
        ) AS liked_by_viewer,
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
      FROM comments c
      WHERE c.id = $1
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
      ),
      inserted AS (
        INSERT INTO comment_likes (comment_id, user_id)
        SELECT $1, $2
        WHERE NOT EXISTS (SELECT 1 FROM removed)
        RETURNING 1
      )
      UPDATE comments c
      SET like_count = GREATEST(
        0,
        c.like_count + CASE WHEN EXISTS (SELECT 1 FROM inserted) THEN 1 ELSE -1 END
      )
      WHERE c.id = $1
    `,
    [commentId, viewerId],
  );

  return getCommentLikeSummary(client, commentId, viewerId);
}

async function createComment(client, input) {
  const { postId, viewerId, content, parentCommentId, imageUrl } = input;

  if (!content && !imageUrl) {
    throw httpError(400, "Comment must include text or an image");
  }

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
      INSERT INTO comments (post_id, user_id, parent_comment_id, body, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [postId, viewerId, parentCommentId || null, content || null, imageUrl || null],
  );

  await client.query(
    `
      UPDATE posts
      SET
        comment_count = comment_count + 1,
        top_level_comment_count = top_level_comment_count + $2::int
      WHERE id = $1
    `,
    [postId, parentCommentId ? 0 : 1],
  );

  if (parentCommentId) {
    await client.query(
      `
        UPDATE comments
        SET reply_count = reply_count + 1
        WHERE id = $1
      `,
      [parentCommentId],
    );
  }

  const commentId = Number.parseInt(rows[0].id, 10);
  const { rows: commentRows } = await client.query(
    `
      SELECT
        c.id,
        c.post_id,
        c.parent_comment_id,
        c.body,
        c.image_url,
        c.created_at,
        c.user_id,
        u.first_name,
        u.last_name,
        FALSE AS liked_by_viewer,
        0 AS like_count,
        0 AS reply_count,
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
  getTopLevelCommentsForPost,
  createPost,
  togglePostLike,
  getPostReactions,
  createComment,
  toggleCommentLike,
};

