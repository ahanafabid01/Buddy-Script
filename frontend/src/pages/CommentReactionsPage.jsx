import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFeedCommentReactions } from "../api/feed";

const REACTION_META = {
  like: { label: "Like", glyph: "👍" },
  love: { label: "Love", glyph: "❤️" },
  care: { label: "Care", glyph: "🤗" },
  haha: { label: "Haha", glyph: "😆" },
  wow: { label: "Wow", glyph: "😮" },
  sad: { label: "Sad", glyph: "😢" },
  angry: { label: "Angry", glyph: "😡" },
};

const REACTION_ORDER = ["like", "love", "care", "haha", "wow", "sad", "angry"];

function emptyReactionCounts() {
  return {
    like: 0,
    love: 0,
    care: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };
}

function initialsFromName(name = "") {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default function CommentReactionsPage() {
  const navigate = useNavigate();
  const { commentId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reactions, setReactions] = useState([]);
  const [reactionCounts, setReactionCounts] = useState(emptyReactionCounts());
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const loadReactions = async () => {
      if (!commentId) {
        setError("Comment not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const reactionsData = await getFeedCommentReactions(commentId);
        setReactions(Array.isArray(reactionsData?.reactions) ? reactionsData.reactions : []);
        setReactionCounts({
          ...emptyReactionCounts(),
          ...(reactionsData?.reactionCounts || {}),
        });
        setActiveFilter("all");
      } catch (requestError) {
        setError(requestError.message || "Failed to load comment reactions");
      } finally {
        setIsLoading(false);
      }
    };

    loadReactions();
  }, [commentId]);

  const totalCount = reactions.length;
  const filteredReactions = useMemo(() => {
    if (activeFilter === "all") return reactions;
    return reactions.filter((entry) => entry.reactionType === activeFilter);
  }, [activeFilter, reactions]);

  const visibleTabs = useMemo(
    () => REACTION_ORDER.filter((reactionType) => Number(reactionCounts[reactionType] || 0) > 0),
    [reactionCounts],
  );

  const emptyMessage = activeFilter === "all"
    ? "No reactions yet."
    : `No ${REACTION_META[activeFilter]?.label || activeFilter} reactions yet.`;

  return (
    <div className="post-reactions-page">
      <header className="post-reactions-header">
        <button type="button" className="post-reactions-back" onClick={() => navigate(-1)} aria-label="Go back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M12.5 4.167L6.667 10l5.833 5.833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="post-reactions-title">People who have reacted</h1>
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
              <button
                type="button"
                role="tab"
                aria-selected={activeFilter === "all"}
                className={`post-reactions-tab ${activeFilter === "all" ? "is-active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All <span>{totalCount}</span>
              </button>
              {visibleTabs.map((reactionType) => (
                <button
                  key={reactionType}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === reactionType}
                  className={`post-reactions-tab ${activeFilter === reactionType ? "is-active" : ""}`}
                  onClick={() => setActiveFilter(reactionType)}
                >
                  {REACTION_META[reactionType].glyph} <span>{reactionCounts[reactionType] || 0}</span>
                </button>
              ))}
            </div>

            {filteredReactions.length === 0 ? (
              <p className="post-reactions-empty">{emptyMessage}</p>
            ) : (
              <ul className="post-reactions-list">
                {filteredReactions.map((entry, index) => {
                  const meta = REACTION_META[entry.reactionType] || REACTION_META.like;

                  return (
                    <li key={`${entry.userId}-${index}`} className="post-reactions-item">
                      <span className="post-reactions-avatar" aria-hidden="true">{initialsFromName(entry.fullName)}</span>
                      <div className="post-reactions-user-meta">
                        <p className="post-reactions-user-name">{entry.fullName || "Unknown user"}</p>
                        <p className="post-reactions-user-reaction">{meta.glyph} {meta.label}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}
