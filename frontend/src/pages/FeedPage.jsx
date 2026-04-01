import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  TEMPLATE_PAGE_ROUTE_MAP,
  NAV_ITEMS,
  NOTIFICATIONS,
  SUGGESTED_LEFT,
  EVENTS,
  STORIES_DESKTOP,
  STORIES_MOBILE,
  POSTS,
  RIGHT_FRIENDS,
} from "./feed/feedData";
import {
  NotificationItem,
  LeftSuggestionItem,
  EventCard,
  TimelinePost,
  RightFriendItem,
} from "./feed/FeedSubcomponents";

export default function FeedPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

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

  return (
    <>
      {/*Feed Section Start*/}
      <div className={`_layout _layout_main_wrapper ${darkMode ? "_dark_wrapper" : ""}`} onClickCapture={handleTemplateLinkClick}>
        <div className="_layout_mode_swithing_btn">
          <button type="button" className="_layout_swithing_btn_link" onClick={() => setDarkMode((previous) => !previous)}>
            <div className="_layout_swithing_btn"><div className="_layout_swithing_btn_round" /></div>
            <div className="_layout_change_btn_ic1">🌙</div>
            <div className="_layout_change_btn_ic2">☀️</div>
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
                    <input className="form-control me-2 _inpt1" type="search" placeholder="input search text" aria-label="Search" />
                  </form>
                </div>

                <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.id} className="nav-item _header_nav_item">
                      <a className={`nav-link _header_nav_link ${item.active ? "_header_nav_link_active" : ""}`} aria-current="page" href={item.href}>
                        {item.label}
                        {item.count ? <span className="_counting">{item.count}</span> : null}
                      </a>
                    </li>
                  ))}

                  <li className="nav-item _header_nav_item">
                    <span
                      id="_notify_btn"
                      className="nav-link _header_nav_link _header_notify_btn"
                      role="button"
                      tabIndex={0}
                      aria-controls="_notify_drop"
                      aria-expanded={notifyOpen}
                      onClick={() => setNotifyOpen((previous) => !previous)}
                      onKeyDown={handleNotificationKeyDown}
                    >
                      Notifications
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
                            {NOTIFICATIONS.map((item) => (
                              <NotificationItem key={item.id} item={item} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </span>
                  </li>
                </ul>

                <div className="_header_nav_profile">
                  <div className="_header_nav_profile_image">
                    <img src="/assets/images/profile.png" alt="Image" className="_nav_profile_img" />
                  </div>
                  <div className="_header_nav_dropdown">
                    <p className="_header_nav_para">{displayName}</p>
                  </div>
                  <a href="login.html" className="_nav_drop_profile" onClick={handleLogout}>Log Out</a>
                </div>
              </div>
            </div>
          </nav>

          <div className="container _custom_container">
            <div className="_layout_inner_wrap">
              <div className="row">
                <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                  <div className="_layout_left_sidebar_wrap">
                    <div className="_layout_left_sidebar_inner">
                      <div className="_left_inner_area_explore _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                        <h4 className="_left_inner_area_explore_title _title5  _mar_b24">Explore</h4>
                        <ul className="_left_inner_area_explore_list">
                          <li className="_left_inner_area_explore_item _explore_item"><a href="#0" className="_left_inner_area_explore_link">Learning</a><span className="_left_inner_area_explore_link_txt">New</span></li>
                          <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link">Insights</a></li>
                          <li className="_left_inner_area_explore_item"><a href="find-friends.html" className="_left_inner_area_explore_link">Find friends</a></li>
                          <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link">Bookmarks</a></li>
                          <li className="_left_inner_area_explore_item"><a href="group.html" className="_left_inner_area_explore_link">Group</a></li>
                          <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link">Settings</a></li>
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
                          <div className="form-floating _feed_inner_text_area_box_form ">
                            <textarea className="form-control _textarea" placeholder="Leave a comment here" id="floatingTextarea" />
                            <label className="_feed_textarea_label" htmlFor="floatingTextarea">Write something ...</label>
                          </div>
                        </div>
                        <div className="_feed_inner_text_area_bottom">
                          <div className="_feed_inner_text_area_item">
                            <div className="_feed_inner_text_area_bottom_photo _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link">Photo</button></div>
                            <div className="_feed_inner_text_area_bottom_video _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link">Video</button></div>
                            <div className="_feed_inner_text_area_bottom_event _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link">Event</button></div>
                            <div className="_feed_inner_text_area_bottom_article _feed_common"><button type="button" className="_feed_inner_text_area_bottom_photo_link">Article</button></div>
                          </div>
                          <div className="_feed_inner_text_area_btn"><button type="button" className="_feed_inner_text_area_btn_link"><span>Post</span></button></div>
                        </div>
                      </div>

                      {POSTS.map((post) => (
                        <TimelinePost key={post.id} post={post} />
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
