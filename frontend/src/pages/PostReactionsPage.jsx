import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFeedPost, getFeedPostReactions } from "../api/feed";

function initialsFromName(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default function PostReactionsPage() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [postAuthorName, setPostAuthorName] = useState("Post");
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    const loadReactions = async () => {
      if (!postId) {
        setError("Post not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const [postData, reactionsData] = await Promise.all([
          getFeedPost(postId),
          getFeedPostReactions(postId),
        ]);

        const authorName = postData?.post?.author?.fullName || "Post";
        setPostAuthorName(authorName);
        setReactions(Array.isArray(reactionsData?.reactions) ? reactionsData.reactions : []);
      } catch (requestError) {
        setError(requestError.message || "Failed to load reactions");
      } finally {
        setIsLoading(false);
      }
    };

    loadReactions();
  }, [postId]);

  const totalCount = reactions.length;
  const likeCount = useMemo(
    () => reactions.filter((entry) => entry.reactionType === "like").length,
    [reactions],
  );

  return (
    <div className="post-reactions-page">
      <header className="post-reactions-header">
        <button type="button" className="post-reactions-back" onClick={() => navigate(-1)} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M12.5 4.167L6.667 10l5.833 5.833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="post-reactions-title">{postAuthorName}&apos;s post</h1>
        <button type="button" className="post-reactions-close" onClick={() => navigate(-1)} aria-label="Close reactions page">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <main className="post-reactions-content">
        {isLoading ? <p className="post-reactions-status">Loading reactions...</p> : null}
        {!isLoading && error ? <p className="post-reactions-status post-reactions-status-error">{error}</p> : null}

        {!isLoading && !error ? (
          <section className="post-reactions-card">
            <div className="post-reactions-tabs" role="tablist" aria-label="Reactions tabs">
              <button type="button" role="tab" aria-selected="true" className="post-reactions-tab is-active">
                All <span>{totalCount}</span>
              </button>
              <button type="button" role="tab" aria-selected="false" className="post-reactions-tab">
                👍 <span>{likeCount}</span>
              </button>
            </div>

            {totalCount === 0 ? (
              <p className="post-reactions-empty">No reactions yet.</p>
            ) : (
              <ul className="post-reactions-list">
                {reactions.map((entry, index) => (
                  <li key={`${entry.userId}-${index}`} className="post-reactions-item">
                    <span className="post-reactions-avatar" aria-hidden="true">{initialsFromName(entry.fullName)}</span>
                    <div className="post-reactions-user-meta">
                      <p className="post-reactions-user-name">{entry.fullName || "Unknown user"}</p>
                      <p className="post-reactions-user-reaction">👍 Like</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
