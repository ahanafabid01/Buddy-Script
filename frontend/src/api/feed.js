import { apiRequest } from "./client";

export function getFeedPosts(params = {}) {
  const query = new URLSearchParams();

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  if (params.cursorCreatedAt) {
    query.set("cursorCreatedAt", params.cursorCreatedAt);
  }

  if (params.cursorId) {
    query.set("cursorId", String(params.cursorId));
  }

  if (params.commentPreviewLimit) {
    query.set("commentPreviewLimit", String(params.commentPreviewLimit));
  }

  const queryString = query.toString();
  return apiRequest(`/feed/posts${queryString ? `?${queryString}` : ""}`);
}

export function createFeedPost({ content, visibility = "public", imageFile = null }) {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("visibility", visibility);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return apiRequest("/feed/posts", {
    method: "POST",
    body: formData,
  });
}

export function getFeedPost(postId) {
  return apiRequest(`/feed/posts/${postId}`);
}

export function toggleFeedPostLike(postId, reactionType = "like") {
  return apiRequest(`/feed/posts/${postId}/likes/toggle`, {
    method: "POST",
    body: { reactionType },
  });
}

export function getFeedPostReactions(postId) {
  return apiRequest(`/feed/posts/${postId}/reactions`);
}

export function createFeedComment(postId, { content, parentCommentId = null, imageFile = null }) {
  if (imageFile) {
    const formData = new FormData();
    if (content && content.trim().length > 0) {
      formData.append("content", content.trim());
    }
    if (parentCommentId !== null && parentCommentId !== undefined) {
      formData.append("parentCommentId", String(parentCommentId));
    }
    formData.append("image", imageFile);

    return apiRequest(`/feed/posts/${postId}/comments`, {
      method: "POST",
      body: formData,
    });
  }

  return apiRequest(`/feed/posts/${postId}/comments`, {
    method: "POST",
    body: {
      content: content?.trim() || null,
      parentCommentId,
    },
  });
}

export function getFeedPostComments(postId, params = {}) {
  const query = new URLSearchParams();

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  if (params.cursorCreatedAt) {
    query.set("cursorCreatedAt", params.cursorCreatedAt);
  }

  if (params.cursorId) {
    query.set("cursorId", String(params.cursorId));
  }

  const queryString = query.toString();
  return apiRequest(`/feed/posts/${postId}/comments${queryString ? `?${queryString}` : ""}`);
}

export function toggleFeedCommentLike(commentId, reactionType = "like") {
  return apiRequest(`/feed/comments/${commentId}/likes/toggle`, {
    method: "POST",
    body: { reactionType },
  });
}
