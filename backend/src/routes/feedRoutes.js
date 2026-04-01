const fs = require("fs/promises");
const express = require("express");
const { z } = require("zod");
const pool = require("../db/pool");
const requireAuth = require("../middleware/requireAuth");
const upload = require("../middleware/upload");
const httpError = require("../utils/httpError");
const {
  getPostsForFeed,
  getPostsByIds,
  getTopLevelCommentsForPost,
  createPost,
  togglePostLike,
  getPostReactions,
  createComment,
  toggleCommentLike,
} = require("../services/feedService");

const router = express.Router();
router.use(requireAuth);

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  visibility: z.enum(["public", "private"]).default("public"),
});

const createCommentSchema = z.object({
  content: z.string().trim().max(2000).optional(),
  parentCommentId: z.number().int().positive().nullable().optional(),
});

function parsePositiveInt(value, fieldName) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw httpError(400, `Invalid ${fieldName}`);
  }
  return parsed;
}

async function removeFileIfExists(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (_error) {
    // Ignore cleanup failures
  }
}

router.get("/posts", async (req, res, next) => {
  try {
    const limit = req.query.limit
      ? parsePositiveInt(req.query.limit, "limit")
      : 10;
    const commentPreviewLimit = req.query.commentPreviewLimit
      ? parsePositiveInt(req.query.commentPreviewLimit, "commentPreviewLimit")
      : 2;

    const cursorCreatedAt = req.query.cursorCreatedAt
      ? new Date(req.query.cursorCreatedAt)
      : null;
    const cursorId = req.query.cursorId
      ? parsePositiveInt(req.query.cursorId, "cursorId")
      : null;

    if (req.query.cursorCreatedAt && Number.isNaN(cursorCreatedAt.getTime())) {
      throw httpError(400, "Invalid cursorCreatedAt");
    }

    const data = await getPostsForFeed(pool, req.auth.userId, {
      limit,
      commentPreviewLimit,
      cursorCreatedAt: cursorCreatedAt ? cursorCreatedAt.toISOString() : null,
      cursorId,
    });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post("/posts", upload.single("image"), async (req, res, next) => {
  try {
    const parsed = createPostSchema.parse({
      content: req.body.content,
      visibility: req.body.visibility || "public",
    });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const postId = await createPost(pool, {
      userId: req.auth.userId,
      content: parsed.content,
      visibility: parsed.visibility,
      imageUrl,
    });

    const posts = await getPostsByIds(pool, req.auth.userId, [postId]);
    return res.status(201).json({ post: posts[0] });
  } catch (error) {
    await removeFileIfExists(req.file?.path);
    return next(error);
  }
});

router.get("/posts/:postId", async (req, res, next) => {
  try {
    const postId = parsePositiveInt(req.params.postId, "postId");
    const posts = await getPostsByIds(pool, req.auth.userId, [postId]);

    if (posts.length === 0) {
      throw httpError(404, "Post not found");
    }

    return res.json({ post: posts[0] });
  } catch (error) {
    return next(error);
  }
});

router.post("/posts/:postId/likes/toggle", async (req, res, next) => {
  try {
    const postId = parsePositiveInt(req.params.postId, "postId");
    const likes = await togglePostLike(pool, postId, req.auth.userId);
    return res.json({ likes });
  } catch (error) {
    return next(error);
  }
});

router.get("/posts/:postId/reactions", async (req, res, next) => {
  try {
    const postId = parsePositiveInt(req.params.postId, "postId");
    const data = await getPostReactions(pool, req.auth.userId, postId);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.get("/posts/:postId/comments", async (req, res, next) => {
  try {
    const postId = parsePositiveInt(req.params.postId, "postId");
    const limit = req.query.limit
      ? parsePositiveInt(req.query.limit, "limit")
      : 10;

    const cursorCreatedAt = req.query.cursorCreatedAt
      ? new Date(req.query.cursorCreatedAt)
      : null;
    const cursorId = req.query.cursorId
      ? parsePositiveInt(req.query.cursorId, "cursorId")
      : null;

    if (req.query.cursorCreatedAt && Number.isNaN(cursorCreatedAt.getTime())) {
      throw httpError(400, "Invalid cursorCreatedAt");
    }

    const data = await getTopLevelCommentsForPost(pool, req.auth.userId, postId, {
      limit,
      cursorCreatedAt: cursorCreatedAt ? cursorCreatedAt.toISOString() : null,
      cursorId,
    });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post("/posts/:postId/comments", upload.single("image"), async (req, res, next) => {
  try {
    const postId = parsePositiveInt(req.params.postId, "postId");
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    const parsed = createCommentSchema.parse({
      content,
      parentCommentId:
        req.body.parentCommentId === undefined ||
        req.body.parentCommentId === null ||
        req.body.parentCommentId === ""
          ? null
          : Number.parseInt(req.body.parentCommentId, 10),
    });

    if (!content && !req.file) {
      throw httpError(400, "Comment must include text or an image");
    }

    const comment = await createComment(pool, {
      postId,
      viewerId: req.auth.userId,
      content: parsed.content || null,
      parentCommentId: parsed.parentCommentId || null,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    return res.status(201).json({ comment });
  } catch (error) {
    await removeFileIfExists(req.file?.path);
    return next(error);
  }
});

router.post("/comments/:commentId/likes/toggle", async (req, res, next) => {
  try {
    const commentId = parsePositiveInt(req.params.commentId, "commentId");
    const likes = await toggleCommentLike(pool, commentId, req.auth.userId);
    return res.json({ likes });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

