import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resolveApiUrl } from "../api/client";
import {
  createFeedComment,
  getFeedPost,
  getFeedPostComments,
  toggleFeedCommentLike,
  toggleFeedPostLike,
} from "../api/feed";
import { TimelinePost } from "./feed/FeedSubcomponents";
import { readFeedDarkMode } from "../utils/theme";

function normalizePost(post) {
  return {
    ...post,
    imageUrl: resolveApiUrl(post.imageUrl),
    topLevelCommentCount: Number.isFinite(post.topLevelCommentCount)
      ? post.topLevelCommentCount
      : Array.isArray(post.comments)
        ? post.comments.length
        : 0,
    commentPagination: post.commentPagination || {
      hasMore: false,
      nextCursor: null,
      pageSize: 2,
    },
    comments: Array.isArray(post.comments) ? post.comments : [],
  };
}

function insertCommentInTree(comments, newComment) {
  if (!newComment.parentCommentId) {
    return [...comments, { ...newComment, replies: newComment.replies || [] }];
  }

  return comments.map((comment) => {
    if (comment.id === newComment.parentCommentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), { ...newComment, replies: newComment.replies || [] }],
      };
    }

    if (!comment.replies || comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: insertCommentInTree(comment.replies, newComment),
    };
  });
}

function updateCommentInTree(comments, commentId, updater) {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return updater(comment);
    }

    if (!comment.replies || comment.replies.length === 0) {
      return comment;
    }

    return {
      ...comment,
      replies: updateCommentInTree(comment.replies, commentId, updater),
    };
  });
}

function mergeTopLevelComments(existingComments, incomingComments) {
  const merged = new Map();

  for (const comment of [...(incomingComments || []), ...(existingComments || [])]) {
    merged.set(comment.id, comment);
  }

  return [...merged.values()].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return a.id - b.id;
  });
}

export default function PostCommentsPage({ modal = false }) {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [isDarkMode, setIsDarkMode] = useState(() => readFeedDarkMode());

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const syncTheme = () => {
      setIsDarkMode(readFeedDarkMode());
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        setError("Post not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");
        const data = await getFeedPost(postId);
        setPost(data?.post ? normalizePost(data.post) : null);
      } catch (requestError) {
        setError(requestError.message || "Failed to load post");
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId]);

  useEffect(() => {
    if (!modal) return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (window.history.length > 1) {
        navigate(-1);
        return;
      }
      navigate("/feed", { replace: true });
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [modal, navigate]);

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/feed", { replace: true });
  };

  const handleTogglePostLike = async (targetPostId, reactionType = "like") => {
    try {
      const data = await toggleFeedPostLike(targetPostId, reactionType);
      setPost((previous) => {
        if (!previous || previous.id !== targetPostId) return previous;
        return {
          ...previous,
          likes: data.likes,
        };
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to update post like");
    }
  };

  const handleCreateComment = async ({ postId: targetPostId, content, parentCommentId = null, imageFile = null }) => {
    const trimmedContent = content.trim();
    if (!trimmedContent && !imageFile) return;

    try {
      const data = await createFeedComment(targetPostId, {
        content: trimmedContent || null,
        parentCommentId,
        imageFile,
      });

      if (!data?.comment) return;

      setPost((previous) => {
        if (!previous || previous.id !== targetPostId) return previous;

        const isTopLevelComment = !parentCommentId;
        return {
          ...previous,
          commentCount: (previous.commentCount || 0) + 1,
          topLevelCommentCount: isTopLevelComment
            ? (previous.topLevelCommentCount || 0) + 1
            : (previous.topLevelCommentCount || 0),
          comments: insertCommentInTree(previous.comments || [], data.comment),
        };
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to add comment");
    }
  };

  const handleToggleCommentLike = async (commentId, reactionType = "like") => {
    try {
      const data = await toggleFeedCommentLike(commentId, reactionType);
      setPost((previous) => {
        if (!previous) return previous;
        return {
          ...previous,
          comments: updateCommentInTree(previous.comments || [], commentId, (comment) => ({
            ...comment,
            likes: data.likes,
          })),
        };
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to update comment like");
    }
  };

  const handleLoadMoreComments = async (targetPostId) => {
    if (!post || post.id !== targetPostId || !post.commentPagination?.hasMore) return 0;

    try {
      const data = await getFeedPostComments(targetPostId, {
        limit: post.commentPagination.pageSize || 10,
        cursorCreatedAt: post.commentPagination.nextCursor?.createdAt || null,
        cursorId: post.commentPagination.nextCursor?.id || null,
      });

      const fetchedComments = Array.isArray(data.comments) ? data.comments : [];

      setPost((previous) => {
        if (!previous || previous.id !== targetPostId) return previous;

        return {
          ...previous,
          topLevelCommentCount: Number.isFinite(data.totalCount)
            ? data.totalCount
            : previous.topLevelCommentCount,
          comments: mergeTopLevelComments(previous.comments || [], fetchedComments),
          commentPagination: {
            ...(previous.commentPagination || {}),
            hasMore: Boolean(data.hasMore),
            nextCursor: data.nextCursor || null,
          },
        };
      });

      return fetchedComments.length;
    } catch (requestError) {
      setError(requestError.message || "Failed to load more comments");
      return 0;
    }
  };

  const handleOpenPostReactions = (targetPostId) => {
    navigate(`/feed/post/${targetPostId}/reactions`);
  };

  const handleOpenCommentReactions = (commentId) => {
    navigate(`/feed/comment/${commentId}/reactions`);
  };

  const pageContent = (
    <div className="post-comments-page">
      <header className="post-comments-header">
        <button type="button" className="post-comments-back" onClick={handleClose} aria-label={modal ? "Close" : "Go back"}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M12.5 4.167L6.667 10l5.833 5.833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="post-comments-title">{post?.author?.fullName ? `${post.author.fullName}'s post` : "Post"}</h1>
        <div className="post-comments-spacer" aria-hidden="true" />
      </header>

      <main className="post-comments-content">
        {isLoading ? <p className="post-comments-status">Loading post...</p> : null}
        {!isLoading && error ? <p className="post-comments-status post-comments-status-error">{error}</p> : null}
        {!isLoading && !error && post ? (
          <TimelinePost
            post={post}
            onTogglePostLike={handleTogglePostLike}
            onCreateComment={handleCreateComment}
            onLoadMoreComments={handleLoadMoreComments}
            onToggleCommentLike={handleToggleCommentLike}
            onOpenComments={() => {}}
            onOpenReactions={handleOpenPostReactions}
            onOpenCommentReactions={handleOpenCommentReactions}
          />
        ) : null}
      </main>
    </div>
  );

  if (modal) {
    return (
      <div className={`post-comments-modal-root ${isDarkMode ? "_dark_wrapper" : ""}`} role="dialog" aria-modal="true" aria-label="Post details dialog">
        <button type="button" className="post-comments-modal-backdrop" onClick={handleClose} aria-label="Close post details" />
        <section className="post-comments-modal-panel" onClick={(event) => event.stopPropagation()}>
          {pageContent}
        </section>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "_dark_wrapper" : ""}>
      {pageContent}
    </div>
  );
}
