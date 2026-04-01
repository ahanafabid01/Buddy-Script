import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resolveApiUrl } from "../api/client";
import {
  createFeedComment,
  createFeedPost,
  getFeedPostComments,
  getFeedPosts,
  toggleFeedCommentLike,
  toggleFeedPostLike,
} from "../api/feed";
import {
  TEMPLATE_PAGE_ROUTE_MAP,
  NAV_ITEMS,
  EXPLORE_ITEMS,
  NOTIFICATIONS,
  SUGGESTED_LEFT,
  EVENTS,
  STORIES_DESKTOP,
  STORIES_MOBILE,
  RIGHT_FRIENDS,
} from "./feed/feedData";
import {
  NotificationItem,
  ExploreListItem,
  HeaderNavIcon,
  LeftSuggestionItem,
  EventCard,
  TimelinePost,
  RightFriendItem,
} from "./feed/FeedSubcomponents";

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

const MAX_POST_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function formatComposerFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

function getComposerImageError(file) {
  if (!file) return "";

  if (!String(file.type || "").startsWith("image/")) {
    return "Only image files are allowed.";
  }

  if (file.size > MAX_POST_IMAGE_SIZE_BYTES) {
    return "Image must be 8MB or smaller.";
  }

  return "";
}

export default function FeedPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [profileDropOpen, setProfileDropOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState("public");
  const [postImageFile, setPostImageFile] = useState(null);
  const [postImagePreviewUrl, setPostImagePreviewUrl] = useState("");
  const [postImageError, setPostImageError] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [composerError, setComposerError] = useState("");
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const profileDropRef = useRef(null);
  const postImageInputRef = useRef(null);

  const displayName = useMemo(() => {
    if (!user) return "Dylan Field";
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return fullName || user.email || "Dylan Field";
  }, [user]);

  const handleTemplateLinkClick = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;

    const anchor = event.target.closest("a[href]");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href) return;

    if (href === "#0" || href === "#") {
      event.preventDefault();
      return;
    }

    if (!href.endsWith(".html")) return;

    const route = TEMPLATE_PAGE_ROUTE_MAP[href];
    if (!route) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    if (route !== window.location.pathname) {
      navigate(route);
    }
  };

  const handleLogout = async (event) => {
    event.preventDefault();
    try {
      await logout();
    } catch (_error) {
      // keep same UX: navigate anyway
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleNotificationKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    setNotifyOpen((previous) => !previous);
  };

  const handleProfileDropdownToggle = () => {
    setProfileDropOpen((previous) => !previous);
  };

  const loadPosts = async () => {
    try {
      setIsFeedLoading(true);
      setFeedError("");
      const data = await getFeedPosts({ limit: 30, commentPreviewLimit: 2 });
      setPosts((data.posts || []).map(normalizePost));
    } catch (error) {
      setFeedError(error.message || "Failed to load feed");
    } finally {
      setIsFeedLoading(false);
    }
  };

  useEffect(() => {
    if (!postImageFile) {
      setPostImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(postImageFile);
    setPostImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [postImageFile]);

  const handleCreatePost = async () => {
    const trimmedContent = postContent.trim();
    if (!trimmedContent || isPosting) {
      if (!trimmedContent) {
        setComposerError("Write something before posting.");
      }
      return;
    }

    try {
      setIsPosting(true);
      setComposerError("");
      const data = await createFeedPost({
        content: trimmedContent,
        visibility: postVisibility,
        imageFile: postImageFile,
      });

      if (data?.post) {
        setPosts((previous) => [normalizePost(data.post), ...previous]);
      }

      setPostContent("");
      setPostImageFile(null);
      setPostImageError("");
      setPostVisibility("public");
      if (postImageInputRef.current) {
        postImageInputRef.current.value = "";
      }
    } catch (error) {
      setFeedError(error.message || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleTogglePostLike = async (postId) => {
    try {
      const data = await toggleFeedPostLike(postId);
      setPosts((previous) => previous.map((post) => (post.id === postId ? { ...post, likes: data.likes } : post)));
    } catch (error) {
      setFeedError(error.message || "Failed to update post like");
    }
  };

  const handleCreateComment = async ({ postId, content, parentCommentId = null, imageFile = null }) => {
    const trimmedContent = content.trim();
    if (!trimmedContent && !imageFile) return;

    try {
      const data = await createFeedComment(postId, {
        content: trimmedContent || null,
        parentCommentId,
        imageFile,
      });

      if (!data?.comment) return;

      setPosts((previous) =>
        previous.map((post) => {
          if (post.id !== postId) return post;

          const isTopLevelComment = !parentCommentId;
          return {
            ...post,
            commentCount: (post.commentCount || 0) + 1,
            topLevelCommentCount: isTopLevelComment
              ? (post.topLevelCommentCount || 0) + 1
              : (post.topLevelCommentCount || 0),
            comments: insertCommentInTree(post.comments || [], data.comment),
          };
        }),
      );
    } catch (error) {
      setFeedError(error.message || "Failed to add comment");
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    try {
      const data = await toggleFeedCommentLike(commentId);
      setPosts((previous) =>
        previous.map((post) => ({
          ...post,
          comments: updateCommentInTree(post.comments || [], commentId, (comment) => ({
            ...comment,
            likes: data.likes,
          })),
        })),
      );
    } catch (error) {
      setFeedError(error.message || "Failed to update comment like");
    }
  };

  const handleLoadMoreComments = async (postId) => {
    const currentPost = posts.find((post) => post.id === postId);
    if (!currentPost?.commentPagination?.hasMore) return 0;

    try {
      const data = await getFeedPostComments(postId, {
        limit: currentPost.commentPagination.pageSize || 10,
        cursorCreatedAt: currentPost.commentPagination.nextCursor?.createdAt || null,
        cursorId: currentPost.commentPagination.nextCursor?.id || null,
      });

      const fetchedComments = Array.isArray(data.comments) ? data.comments : [];

      setPosts((previous) =>
        previous.map((post) => {
          if (post.id !== postId) return post;

          return {
            ...post,
            topLevelCommentCount: Number.isFinite(data.totalCount)
              ? data.totalCount
              : post.topLevelCommentCount,
            comments: mergeTopLevelComments(post.comments || [], fetchedComments),
            commentPagination: {
              ...(post.commentPagination || {}),
              hasMore: Boolean(data.hasMore),
              nextCursor: data.nextCursor || null,
            },
          };
        }),
      );

      return fetchedComments.length;
    } catch (error) {
      setFeedError(error.message || "Failed to load more comments");
      return 0;
    }
  };

  const handleComposerPhotoClick = () => {
    postImageInputRef.current?.click();
  };

  const handleComposerPhotoChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;

    const imageError = getComposerImageError(selectedFile);
    if (imageError) {
      setPostImageError(imageError);
      setPostImageFile(null);
      if (postImageInputRef.current) {
        postImageInputRef.current.value = "";
      }
      return;
    }

    setPostImageFile(selectedFile);
    setPostImageError("");
    setComposerError("");
  };

  const handleComposerRemovePhoto = () => {
    setPostImageFile(null);
    setPostImageError("");
    if (postImageInputRef.current) {
      postImageInputRef.current.value = "";
    }
  };

  const handleComposerKeyDown = (event) => {
    if (event.key !== "Enter") return;
    if (event.shiftKey) return;

    event.preventDefault();
    handleCreatePost();
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!(event.target instanceof Node)) return;
      if (!profileDropRef.current) return;
      if (profileDropRef.current.contains(event.target)) return;
      setProfileDropOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setProfileDropOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <>
      {/*Feed Section Start*/}
      <div className={`_layout _layout_main_wrapper ${darkMode ? "_dark_wrapper" : ""}`} onClickCapture={handleTemplateLinkClick}>
        <div className="_layout_mode_swithing_btn">
          <button type="button" className="_layout_swithing_btn_link" onClick={() => setDarkMode((previous) => !previous)}>
            <div className="_layout_swithing_btn"><div className="_layout_swithing_btn_round" /></div>
            <div className="_layout_change_btn_ic1">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" fill="none" viewBox="0 0 11 16">
                <path fill="#fff" d="M2.727 14.977l.04-.498-.04.498zm-1.72-.49l.489-.11-.489.11zM3.232 1.212L3.514.8l-.282.413zM9.792 8a6.5 6.5 0 00-6.5-6.5v-1a7.5 7.5 0 017.5 7.5h-1zm-6.5 6.5a6.5 6.5 0 006.5-6.5h1a7.5 7.5 0 01-7.5 7.5v-1zm-.525-.02c.173.013.348.02.525.02v1c-.204 0-.405-.008-.605-.024l.08-.997zm-.261-1.83A6.498 6.498 0 005.792 7h1a7.498 7.498 0 01-3.791 6.52l-.495-.87zM5.792 7a6.493 6.493 0 00-2.841-5.374L3.514.8A7.493 7.493 0 016.792 7h-1zm-3.105 8.476c-.528-.042-.985-.077-1.314-.155-.316-.075-.746-.242-.854-.726l.977-.217c-.028-.124-.145-.09.106-.03.237.056.6.086 1.165.131l-.08.997zm.314-1.956c-.622.354-1.045.596-1.31.792a.967.967 0 00-.204.185c-.01.013.027-.038.009-.12l-.977.218a.836.836 0 01.144-.666c.112-.162.27-.3.433-.42.324-.24.814-.519 1.41-.858L3 13.52zM3.292 1.5a.391.391 0 00.374-.285A.382.382 0 003.514.8l-.563.826A.618.618 0 012.702.95a.609.609 0 01.59-.45v1z"/>
              </svg>
            </div>
            <div className="_layout_change_btn_ic2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4.389" stroke="#fff" transform="rotate(-90 12 12)"/>
                <path stroke="#fff" strokeLinecap="round" d="M3.444 12H1M23 12h-2.444M5.95 5.95L4.222 4.22M19.778 19.779L18.05 18.05M12 3.444V1M12 23v-2.445M18.05 5.95l1.728-1.729M4.222 19.779L5.95 18.05"/>
              </svg>
            </div>
          </button>
        </div>

        <div className="_main_layout">
          <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
            <div className="container _custom_container">
              <div className="_logo_wrap">
                <a className="navbar-brand" href="feed.html">
                  <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
                </a>
              </div>

              <div className="collapse navbar-collapse">
                <div className="_header_form ms-auto">
                  <form className="_header_form_grp">
                    <HeaderNavIcon name="search" className="_header_form_svg" />
                    <input className="form-control me-2 _inpt1" type="search" placeholder="input search text" aria-label="Search" />
                  </form>
                </div>

                <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                  {NAV_ITEMS.map((item, index) => (
                    <Fragment key={item.id}>
                      <li className="nav-item _header_nav_item">
                        <a
                          className={`nav-link _header_nav_link ${item.active ? "_header_nav_link_active" : ""}`}
                          aria-current={item.active ? "page" : undefined}
                          aria-label={item.label}
                          title={item.label}
                          href={item.href}
                        >
                          <HeaderNavIcon name={item.id} active={item.active} />
                          {item.count ? <span className="_counting">{item.count}</span> : null}
                        </a>
                      </li>
                      {item.id === "friends" && (
                        <li className="nav-item _header_nav_item">
                          <span
                            id="_notify_btn"
                            className="nav-link _header_nav_link _header_notify_btn"
                            role="button"
                            tabIndex={0}
                            aria-controls="_notify_drop"
                            aria-expanded={notifyOpen}
                            aria-label="Notifications"
                            title="Notifications"
                            onClick={() => setNotifyOpen((previous) => !previous)}
                            onKeyDown={handleNotificationKeyDown}
                          >
                            <HeaderNavIcon name="notifications" />
                            <span className="_counting">6</span>
                            <div id="_notify_drop" className={`_notification_dropdown ${notifyOpen ? "show" : ""}`}>
                              <div className="_notifications_content">
                                <h4 className="_notifications_content_title">Notifications</h4>
                              </div>
                              <div className="_notifications_drop_box">
                                <div className="_notifications_drop_btn_grp">
                                  <button className="_notifications_btn_link" type="button">All</button>
                                  <button className="_notifications_btn_link1" type="button">Unread</button>
                                </div>
                                <div className="_notifications_all">
                                  {NOTIFICATIONS.map((notif) => (
                                    <NotificationItem key={notif.id} item={notif} />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </span>
                        </li>
                      )}
                    </Fragment>
                  ))}
                </ul>

                <div className="_header_nav_profile" ref={profileDropRef}>
                  <div className="_header_nav_profile_image">
                    <img src="/assets/images/profile.png" alt="Image" className="_nav_profile_img" />
                  </div>
                  <div className="_header_nav_dropdown">
                    <p className="_header_nav_para">{displayName}</p>
                    <button
                      id="_profile_drop_show_btn"
                      type="button"
                      className="_header_nav_dropdown_btn"
                      aria-label="Open profile menu"
                      aria-controls="_prfoile_drop"
                      aria-expanded={profileDropOpen}
                      onClick={handleProfileDropdownToggle}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                        <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                      </svg>
                    </button>
                  </div>

                  <div id="_prfoile_drop" className={`_nav_profile_dropdown _profile_dropdown ${profileDropOpen ? "show" : ""}`}>
                    <div className="_nav_profile_dropdown_info">
                      <div className="_nav_profile_dropdown_image">
                        <img src="/assets/images/profile.png" alt="Image" className="_nav_drop_img" />
                      </div>
                      <div className="_nav_profile_dropdown_info_txt">
                        <h4 className="_nav_dropdown_title">{displayName}</h4>
                        <a href="profile.html" className="_nav_drop_profile">
                          View Profile
                        </a>
                      </div>
                    </div>
                    <hr />
                    <ul className="_nav_dropdown_list">
                      <li className="_nav_dropdown_list_item">
                        <a href="login.html" className="_nav_dropdown_link" onClick={handleLogout}>
                          <div className="_nav_drop_info">
                            <span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                                <path stroke="#377DFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.667 18H2.889A1.889 1.889 0 011 16.111V2.89A1.889 1.889 0 012.889 1h3.778M13.277 14.222L18 9.5l-4.723-4.722M18 9.5H6.667" />
                              </svg>
                            </span>
                            Log Out
                          </div>
                          <span className="_nav_drop_btn_link" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" width="6" height="10" fill="none" viewBox="0 0 6 10">
                              <path fill="#112032" d="M5 5l.354.354L5.707 5l-.353-.354L5 5zM1.354 9.354l4-4-.708-.708-4 4 .708.708zm4-4.708l-4-4-.708.708 4 4 .708-.708z" opacity=".5" />
                            </svg>
                          </span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="_header_mobile_menu">
            <div className="_header_mobile_menu_wrap">
              <div className="container">
                <div className="_header_mobile_menu">
                  <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                      <div className="_header_mobile_menu_top_inner">
                        <div className="_header_mobile_menu_logo">
                          <a href="feed.html" className="_mobile_logo_link">
                            <img src="/assets/images/logo.svg" alt="Image" className="_nav_logo" />
                          </a>
                        </div>
                        <div className="_header_mobile_menu_right">
                          <a href="#0" className="_header_mobile_search" aria-label="Search">
                            <HeaderNavIcon name="search" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="_mobile_navigation_bottom_wrapper">
            <div className="_mobile_navigation_bottom_wrap">
              <div className="container">
                <div className="row">
                  <div className="col-xl-12 col-lg-12 col-md-12">
                    <ul className="_mobile_navigation_bottom_list">
                      <li className="_mobile_navigation_bottom_item">
                        <a href="feed.html" className="_mobile_navigation_bottom_link _mobile_navigation_bottom_link_active" aria-label="Home">
                          <HeaderNavIcon name="home" active />
                        </a>
                      </li>
                      <li className="_mobile_navigation_bottom_item">
                        <a href="friend-request.html" className="_mobile_navigation_bottom_link" aria-label="Friends">
                          <HeaderNavIcon name="friends" />
                        </a>
                      </li>
                      <li className="_mobile_navigation_bottom_item">
                        <a href="#0" className="_mobile_navigation_bottom_link" aria-label="Notifications">
                          <HeaderNavIcon name="notifications" />
                          <span className="_counting">6</span>
                        </a>
                      </li>
                      <li className="_mobile_navigation_bottom_item">
                        <a href="chat.html" className="_mobile_navigation_bottom_link" aria-label="Chat">
                          <HeaderNavIcon name="chat" />
                          <span className="_counting">2</span>
                        </a>
                      </li>
                      <li className="_mobile_navigation_bottom_item">
                        <a href="#0" className="_mobile_navigation_bottom_link" aria-label="Menu">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" fill="none" viewBox="0 0 18 14">
                            <path stroke="#666" strokeLinecap="round" strokeWidth="1.5" d="M1 1h16M1 7h16M1 13h16" />
                          </svg>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container _custom_container">
            <div className="_layout_inner_wrap">
              <div className="row">
                <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                  <div className="_layout_left_sidebar_wrap">
                    <div className="_layout_left_sidebar_inner">
                      <div className="_left_inner_area_explore _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                        <h4 className="_left_inner_area_explore_title _title5  _mar_b24">Explore</h4>
                        <ul className="_left_inner_area_explore_list">
                          {EXPLORE_ITEMS.map((item) => (
                            <ExploreListItem key={item.id} item={item} />
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="_layout_left_sidebar_inner">
                      <div className="_left_inner_area_suggest _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                        <div className="_left_inner_area_suggest_content _mar_b24">
                          <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
                          <span className="_left_inner_area_suggest_content_txt"><a className="_left_inner_area_suggest_content_txt_link" href="#0">See All</a></span>
                        </div>
                        {SUGGESTED_LEFT.map((person) => (
                          <LeftSuggestionItem key={person.id} person={person} />
                        ))}
                      </div>
                    </div>

                    <div className="_layout_left_sidebar_inner">
                      <div className="_left_inner_area_event _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                        <div className="_left_inner_event_content">
                          <h4 className="_left_inner_event_title _title5">Events</h4>
                          <a href="event.html" className="_left_inner_event_link">See all</a>
                        </div>
                        {EVENTS.map((eventItem) => (
                          <EventCard key={eventItem.id} eventItem={eventItem} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                  <div className="_layout_middle_wrap">
                    <div className="_layout_middle_inner">
                      <div className="_feed_inner_ppl_card _mar_b16">
                        <div className="_feed_inner_story_arrow"><button type="button" className="_feed_inner_story_arrow_btn">&gt;</button></div>
                        <div className="row">
                          <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
                            <div className="_feed_inner_profile_story _b_radious6 ">
                              <div className="_feed_inner_profile_story_image">
                                <img src="/assets/images/card_ppl1.png" alt="Image" className="_profile_story_img" />
                                <div className="_feed_inner_story_txt">
                                  <div className="_feed_inner_story_btn"><button className="_feed_inner_story_btn_link" type="button">+</button></div>
                                  <p className="_feed_inner_story_para">Your Story</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          {STORIES_DESKTOP.map((story) => (
                            <div key={story.id} className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
                              <div className="_feed_inner_public_story _b_radious6">
                                <div className="_feed_inner_public_story_image">
                                  <img src={story.image} alt="Image" className="_public_story_img" />
                                  <div className="_feed_inner_pulic_story_txt"><p className="_feed_inner_pulic_story_para">{story.name}</p></div>
                                  <div className="_feed_inner_public_mini"><img src="/assets/images/mini_pic.png" alt="Image" className="_public_mini_img" /></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="_feed_inner_ppl_card_mobile _mar_b16">
                        <div className="_feed_inner_ppl_card_area">
                          <ul className="_feed_inner_ppl_card_area_list">
                            {STORIES_MOBILE.map((story) => (
                              <li key={story.id} className="_feed_inner_ppl_card_area_item">
                                <a href="#0" className="_feed_inner_ppl_card_area_link">
                                  <div className={story.active ? "_feed_inner_ppl_card_area_story_active" : "_feed_inner_ppl_card_area_story"}>
                                    <img src={story.image} alt="Image" className={story.yourStory ? "_card_story_img" : "_card_story_img1"} />
                                  </div>
                                  <p className={story.yourStory ? "_feed_inner_ppl_card_area_link_txt" : "_feed_inner_ppl_card_area_txt"}>{story.yourStory ? "Your Story" : "Ryan..."}</p>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="_feed_inner_text_area  _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
                        <div className="_feed_inner_text_area_box">
                          <div className="_feed_inner_text_area_box_image"><img src="/assets/images/txt_img.png" alt="Image" className="_txt_img" /></div>
                          <div className="_feed_inner_text_area_box_form ">
                            <textarea
                              className={`form-control _textarea composer-textarea ${!isComposerFocused && !postContent.trim() ? "is-collapsed" : ""}`}
                              placeholder=""
                              id="floatingTextarea"
                              value={postContent}
                              onChange={(event) => {
                                setPostContent(event.target.value);
                                if (composerError) {
                                  setComposerError("");
                                }
                              }}
                              onKeyDown={handleComposerKeyDown}
                              onFocus={() => setIsComposerFocused(true)}
                              onBlur={() => setIsComposerFocused(false)}
                            />
                            {!postContent.trim() ? (
                              <label htmlFor="floatingTextarea" className="_feed_textarea_label composer-write-label">
                                <span>Write something ...</span>
                                <span className="composer-write-icon" aria-hidden="true">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.667 3.333l3 3M2.667 13.333l2.54-.424a2 2 0 001.03-.536l7.102-7.102a1.414 1.414 0 00-2-2L4.236 10.373a2 2 0 00-.536 1.03l-.424 1.93a.4.4 0 00.47.47l1.92-.47z"/>
                                  </svg>
                                </span>
                              </label>
                            ) : null}
                          </div>
                        </div>
                        <div className="composer-meta-row">
                          <div className="composer-meta-left">
                            <div className={`composer-audience-picker ${postVisibility === "public" ? "is-public" : "is-private"}`}>
                              <span className="composer-audience-label">Audience:</span>
                              <select
                                className="composer-audience-select"
                                value={postVisibility}
                                onChange={(event) => setPostVisibility(event.target.value)}
                                aria-label="Post visibility"
                              >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        {postImageFile && postImagePreviewUrl ? (
                          <div className="composer-preview-card">
                            <img src={postImagePreviewUrl} alt="Selected post attachment" className="composer-preview-thumb" />
                            <div className="composer-preview-meta">
                              <p className="composer-preview-name" title={postImageFile.name}>{postImageFile.name}</p>
                              <p className="composer-preview-size">{formatComposerFileSize(postImageFile.size)}</p>
                            </div>
                            <button type="button" className="composer-clear-btn composer-preview-remove" onClick={handleComposerRemovePhoto}>
                              Remove
                            </button>
                          </div>
                        ) : null}
                        {postImageError ? <p className="form-error composer-form-error">{postImageError}</p> : null}
                        {composerError ? <p className="form-error">{composerError}</p> : null}
                        <div className="_feed_inner_text_area_bottom">
                          <div className="_feed_inner_text_area_item">
                            <div className="_feed_inner_text_area_bottom_photo _feed_common">
                              <button type="button" className="_feed_inner_text_area_bottom_photo_link" onClick={handleComposerPhotoClick}>
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                                    <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"/>
                                  </svg>
                                </span>
                                Photo
                              </button>
                            </div>
                            <div className="_feed_inner_text_area_bottom_video _feed_common">
                              <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                    <path fill="#666" d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726zm0 1.5H5.76C4.169 6 3.197 7.05 3.197 8.688v7.015c0 1.636.972 2.688 2.562 2.688h5.726c1.586 0 2.562-1.054 2.562-2.688v-.686-6.329c0-1.636-.973-2.688-2.562-2.688zM18.4 8.57l-.062.02-2.921 1.306v4.596l2.921 1.307c.165.073.343-.036.38-.215l.008-.07V8.876c0-.195-.16-.334-.326-.305z"/>
                                  </svg>
                                </span>
                                Video
                              </button>
                            </div>
                            <div className="_feed_inner_text_area_bottom_event _feed_common">
                              <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                    <path fill="#666" d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698.32 0 .584.262.626.603l.006.095v.771h5.546v-.771c0-.386.284-.698.633-.698zm3.546 8.283H4.004l.001 6.621c0 2.325 1.137 3.616 3.183 3.697l.207.004h7.132c2.184 0 3.39-1.271 3.39-3.63v-6.692zm-3.202 5.853c.349 0 .632.312.632.698 0 .353-.238.645-.546.691l-.086.006c-.357 0-.64-.312-.64-.697 0-.354.237-.645.546-.692l.094-.006zm-3.742 0c.35 0 .632.312.632.698 0 .353-.238.645-.546.691l-.086.006c-.357 0-.64-.312-.64-.697 0-.354.238-.645.546-.692l.094-.006zm-3.75 0c.35 0 .633.312.633.698 0 .353-.238.645-.547.691l-.093.006c-.35 0-.633-.312-.633-.697 0-.354.238-.645.547-.692l.094-.006zm7.492-3.615c.349 0 .632.312.632.697 0 .354-.238.645-.546.692l-.086.006c-.357 0-.64-.312-.64-.698 0-.353.237-.645.546-.691l.094-.006zm-3.742 0c.35 0 .632.312.632.697 0 .354-.238.645-.546.692l-.086.006c-.357 0-.64-.312-.64-.698 0-.353.238-.645.546-.691l.094-.006zm-3.75 0c.35 0 .633.312.633.697 0 .354-.238.645-.547.692l-.093.006c-.35 0-.633-.312-.633-.698 0-.353.238-.645.547-.691l.094-.006zm6.515-7.657H8.192v.895c0 .385-.283.698-.633.698-.32 0-.584-.263-.626-.603l-.006-.095v-.874c-1.886.173-2.922 1.422-2.922 3.6v.402h13.912v-.403c.007-2.181-1.024-3.427-2.914-3.599v.874c0 .385-.283.698-.632.698-.32 0-.585-.263-.627-.603l-.005-.095v-.895z"/>
                                  </svg>
                                </span>
                                Event
                              </button>
                            </div>
                            <div className="_feed_inner_text_area_bottom_article _feed_common">
                              <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" fill="none" viewBox="0 0 18 20">
                                    <path fill="#666" d="M12.49 0c2.92 0 4.665 1.92 4.693 5.132v9.659c0 3.257-1.75 5.209-4.693 5.209H5.434c-.377 0-.734-.032-1.07-.095l-.2-.041C2 19.371.74 17.555.74 14.791V5.209c0-.334.019-.654.055-.96C1.114 1.564 2.799 0 5.434 0h7.056zm-.008 1.457H5.434c-2.244 0-3.381 1.263-3.381 3.752v9.582c0 2.489 1.137 3.752 3.38 3.752h7.049c2.242 0 3.372-1.263 3.372-3.752V5.209c0-2.489-1.13-3.752-3.372-3.752zm-.239 12.053c.36 0 .652.324.652.724 0 .4-.292.724-.652.724H5.656c-.36 0-.652-.324-.652-.724 0-.4.293-.724.652-.724h6.587zm0-4.239a.643.643 0 01.632.339.806.806 0 010 .78.643.643 0 01-.632.339H5.656c-.334-.042-.587-.355-.587-.729s.253-.688.587-.729h6.587zM8.17 5.042c.335.041.588.355.588.729 0 .373-.253.687-.588.728H5.665c-.336-.041-.589-.355-.589-.728 0-.374.253-.688.589-.729H8.17z"/>
                                  </svg>
                                </span>
                                Article
                              </button>
                            </div>
                          </div>
                          <div className="_feed_inner_text_area_btn">
                            <button
                              type="button"
                              className="_feed_inner_text_area_btn_link"
                              onClick={handleCreatePost}
                              disabled={isPosting || postContent.trim().length === 0}
                            >
                              <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                                <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                              </svg>
                              <span>{isPosting ? "Posting..." : "Post"}</span>
                            </button>
                          </div>
                        </div>
                        <div className="_feed_inner_text_area_bottom_mobile">
                          <div className="_feed_inner_text_mobile">
                            <div className="_feed_inner_text_area_item">
                              <div className="_feed_inner_text_area_bottom_photo _feed_common">
                                <button type="button" className="_feed_inner_text_area_bottom_photo_link" onClick={handleComposerPhotoClick} aria-label="Add photo">
                                  <span className="_feed_inner_text_area_bottom_photo_iamge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                                      <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917zm0 1.504H5.999c-2.321 0-3.799 1.735-3.799 4.41v8.17c0 2.68 1.472 4.412 3.799 4.412h7.917c2.328 0 3.807-1.734 3.807-4.411v-8.17c0-2.678-1.478-4.411-3.807-4.411zm.65 8.68l.12.125 1.9 2.147a.803.803 0 01-.016 1.063.642.642 0 01-.894.058l-.076-.074-1.9-2.148a.806.806 0 00-1.205-.028l-.074.087-2.04 2.717c-.722.963-2.02 1.066-2.86.26l-.111-.116-.814-.91a.562.562 0 00-.793-.07l-.075.073-1.4 1.617a.645.645 0 01-.97.029.805.805 0 01-.09-.977l.064-.086 1.4-1.617c.736-.852 1.95-.897 2.734-.137l.114.12.81.905a.587.587 0 00.861.033l.07-.078 2.04-2.718c.81-1.08 2.27-1.19 3.205-.275zM6.831 4.64c1.265 0 2.292 1.125 2.292 2.51 0 1.386-1.027 2.511-2.292 2.511S4.54 8.537 4.54 7.152c0-1.386 1.026-2.51 2.291-2.51zm0 1.504c-.507 0-.918.451-.918 1.007 0 .555.411 1.006.918 1.006.507 0 .919-.451.919-1.006 0-.556-.412-1.007-.919-1.007z"/>
                                    </svg>
                                  </span>
                                </button>
                              </div>
                              <div className="_feed_inner_text_area_bottom_video _feed_common">
                                <button type="button" className="_feed_inner_text_area_bottom_photo_link" aria-label="Add video">
                                  <span className="_feed_inner_text_area_bottom_photo_iamge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                      <path fill="#666" d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726zm0 1.5H5.76C4.169 6 3.197 7.05 3.197 8.688v7.015c0 1.636.972 2.688 2.562 2.688h5.726c1.586 0 2.562-1.054 2.562-2.688v-.686-6.329c0-1.636-.973-2.688-2.562-2.688zM18.4 8.57l-.062.02-2.921 1.306v4.596l2.921 1.307c.165.073.343-.036.38-.215l.008-.07V8.876c0-.195-.16-.334-.326-.305z"/>
                                    </svg>
                                  </span>
                                </button>
                              </div>
                              <div className="_feed_inner_text_area_bottom_event _feed_common">
                                <button type="button" className="_feed_inner_text_area_bottom_photo_link" aria-label="Create event">
                                  <span className="_feed_inner_text_area_bottom_photo_iamge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                      <path fill="#666" d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698.32 0 .584.262.626.603l.006.095v.771h5.546v-.771c0-.386.284-.698.633-.698zm3.546 8.283H4.004l.001 6.621c0 2.325 1.137 3.616 3.183 3.697l.207.004h7.132c2.184 0 3.39-1.271 3.39-3.63v-6.692zm-3.202 5.853c.349 0 .632.312.632.698 0 .353-.238.645-.546.691l-.086.006c-.357 0-.64-.312-.64-.697 0-.354.237-.645.546-.692l.094-.006zm-3.742 0c.35 0 .632.312.632.698 0 .353-.238.645-.546.691l-.086.006c-.357 0-.64-.312-.64-.697 0-.354.238-.645.546-.692l.094-.006zm-3.75 0c.35 0 .633.312.633.698 0 .353-.238.645-.547.691l-.093.006c-.35 0-.633-.312-.633-.697 0-.354.238-.645.547-.692l.094-.006zm7.492-3.615c.349 0 .632.312.632.697 0 .354-.238.645-.546.692l-.086.006c-.357 0-.64-.312-.64-.698 0-.353.237-.645.546-.691l.094-.006zm-3.742 0c.35 0 .632.312.632.697 0 .354-.238.645-.546.692l-.086.006c-.357 0-.64-.312-.64-.698 0-.353.238-.645.546-.691l.094-.006zm-3.75 0c.35 0 .633.312.633.697 0 .354-.238.645-.547.692l-.093.006c-.35 0-.633-.312-.633-.698 0-.353.238-.645.547-.691l.094-.006zm6.515-7.657H8.192v.895c0 .385-.283.698-.633.698-.32 0-.584-.263-.626-.603l-.006-.095v-.874c-1.886.173-2.922 1.422-2.922 3.6v.402h13.912v-.403c.007-2.181-1.024-3.427-2.914-3.599v.874c0 .385-.283.698-.632.698-.32 0-.585-.263-.627-.603l-.005-.095v-.895z"/>
                                    </svg>
                                  </span>
                                </button>
                              </div>
                              <div className="_feed_inner_text_area_bottom_article _feed_common">
                                <button type="button" className="_feed_inner_text_area_bottom_photo_link" aria-label="Write article">
                                  <span className="_feed_inner_text_area_bottom_photo_iamge">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" fill="none" viewBox="0 0 18 20">
                                      <path fill="#666" d="M12.49 0c2.92 0 4.665 1.92 4.693 5.132v9.659c0 3.257-1.75 5.209-4.693 5.209H5.434c-.377 0-.734-.032-1.07-.095l-.2-.041C2 19.371.74 17.555.74 14.791V5.209c0-.334.019-.654.055-.96C1.114 1.564 2.799 0 5.434 0h7.056zm-.008 1.457H5.434c-2.244 0-3.381 1.263-3.381 3.752v9.582c0 2.489 1.137 3.752 3.38 3.752h7.049c2.242 0 3.372-1.263 3.372-3.752V5.209c0-2.489-1.13-3.752-3.372-3.752zm-.239 12.053c.36 0 .652.324.652.724 0 .4-.292.724-.652.724H5.656c-.36 0-.652-.324-.652-.724 0-.4.293-.724.652-.724h6.587zm0-4.239a.643.643 0 01.632.339.806.806 0 010 .78.643.643 0 01-.632.339H5.656c-.334-.042-.587-.355-.587-.729s.253-.688.587-.729h6.587zM8.17 5.042c.335.041.588.355.588.729 0 .373-.253.687-.588.728H5.665c-.336-.041-.589-.355-.589-.728 0-.374.253-.688.589-.729H8.17z"/>
                                    </svg>
                                  </span>
                                </button>
                              </div>
                            </div>
                            <div className="_feed_inner_text_area_btn">
                              <button
                                type="button"
                                className="_feed_inner_text_area_btn_link"
                                onClick={handleCreatePost}
                                disabled={isPosting || postContent.trim().length === 0}
                              >
                                <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                                  <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                                </svg>
                                <span>{isPosting ? "Posting..." : "Post"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <input
                          ref={postImageInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleComposerPhotoChange}
                          style={{ display: "none" }}
                        />
                      </div>

                      {feedError ? <p className="_feed_inner_timeline_post_title">{feedError}</p> : null}
                      {isFeedLoading ? <p className="_feed_inner_timeline_post_title">Loading posts...</p> : null}
                      {!isFeedLoading && posts.map((post) => (
                        <TimelinePost
                          key={post.id}
                          post={post}
                          onTogglePostLike={handleTogglePostLike}
                          onCreateComment={handleCreateComment}
                          onLoadMoreComments={handleLoadMoreComments}
                          onToggleCommentLike={handleToggleCommentLike}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                  <div className="_layout_right_sidebar_wrap">
                    <div className="_layout_right_sidebar_inner">
                      <div className="_right_inner_area_info _padd_t24  _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                        <div className="_right_inner_area_info_content _mar_b24">
                          <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
                          <span className="_right_inner_area_info_content_txt"><a className="_right_inner_area_info_content_txt_link" href="#0">See All</a></span>
                        </div>
                        <hr className="_underline" />
                        <div className="_right_inner_area_info_ppl">
                          <div className="_right_inner_area_info_box">
                            <div className="_right_inner_area_info_box_image"><a href="profile.html"><img src="/assets/images/Avatar.png" alt="Image" className="_ppl_img" /></a></div>
                            <div className="_right_inner_area_info_box_txt">
                              <a href="profile.html"><h4 className="_right_inner_area_info_box_title">Radovan SkillArena</h4></a>
                              <p className="_right_inner_area_info_box_para">Founder &amp; CEO at Trophy</p>
                            </div>
                          </div>
                          <div className="_right_info_btn_grp">
                            <button type="button" className="_right_info_btn_link">Ignore</button>
                            <button type="button" className="_right_info_btn_link _right_info_btn_link_active">Follow</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="_layout_right_sidebar_inner">
                      <div className="_feed_right_inner_area_card  _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                        <div className="_feed_top_fixed">
                          <div className="_feed_right_inner_area_card_content _mar_b24">
                            <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
                            <span className="_feed_right_inner_area_card_content_txt"><a className="_feed_right_inner_area_card_content_txt_link" href="find-friends.html">See All</a></span>
                          </div>
                          <form className="_feed_right_inner_area_card_form">
                            <svg className="_feed_right_inner_area_card_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                              <circle cx="7" cy="7" r="6" stroke="#666"></circle>
                              <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3"></path>
                            </svg>
                            <input className="form-control me-2 _feed_right_inner_area_card_form_inpt" type="search" placeholder="input search text" aria-label="Search" />
                          </form>
                        </div>
                        <div className="_feed_bottom_fixed">
                          {RIGHT_FRIENDS.map((friend) => (
                            <RightFriendItem key={friend.id} friend={friend} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/*Feed Section End*/}
    </>
  );
}
