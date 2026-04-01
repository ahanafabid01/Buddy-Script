export function NotificationItem({ item }) {
  return (
    <div className="_notification_box">
      <div className="_notification_image">
        <img src={item.image} alt="Image" className="_notify_img" />
      </div>
      <div className="_notification_txt">
        {item.isGroup ? (
          <p className="_notification_para">
            An admin changed the name of the group
            <span className="_notify_txt_link">{item.groupFrom}</span>
            to
            <span className="_notify_txt_link">{item.groupTo}</span>
          </p>
        ) : (
          <p className="_notification_para">
            <span className="_notify_txt_link">{item.name}</span>
            posted a link in your timeline.
          </p>
        )}
        <div className="_nitification_time">
          <span>{item.time}</span>
        </div>
      </div>
    </div>
  );
}

export function LeftSuggestionItem({ person }) {
  return (
    <div className="_left_inner_area_suggest_info">
      <div className="_left_inner_area_suggest_info_box">
        <div className="_left_inner_area_suggest_info_image">
          <a href="profile.html">
            <img src={person.image} alt="Image" className={person.large ? "_info_img" : "_info_img1"} />
          </a>
        </div>
        <div className="_left_inner_area_suggest_info_txt">
          <a href="profile.html">
            <h4 className="_left_inner_area_suggest_info_title">{person.name}</h4>
          </a>
          <p className="_left_inner_area_suggest_info_para">{person.role}</p>
        </div>
      </div>
      <div className="_left_inner_area_suggest_info_link">
        <a href="#0" className="_info_link">Connect</a>
      </div>
    </div>
  );
}

export function EventCard({ eventItem }) {
  return (
    <a className="_left_inner_event_card_link" href="event-single.html">
      <div className="_left_inner_event_card">
        <div className="_left_inner_event_card_iamge">
          <img src={eventItem.image} alt="Image" className="_card_img" />
        </div>
        <div className="_left_inner_event_card_content">
          <div className="_left_inner_card_date">
            <p className="_left_inner_card_date_para">{eventItem.day}</p>
            <p className="_left_inner_card_date_para1">{eventItem.month}</p>
          </div>
          <div className="_left_inner_card_txt">
            <h4 className="_left_inner_event_card_title">{eventItem.title}</h4>
          </div>
        </div>
        <hr className="_underline" />
        <div className="_left_inner_event_bottom">
          <p className="_left_iner_event_bottom">{eventItem.going}</p>
          <a href="#0" className="_left_iner_event_bottom_link">Going</a>
        </div>
      </div>
    </a>
  );
}

export function TimelinePost({ post }) {
  return (
    <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
      <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
        <div className="_feed_inner_timeline_post_top">
          <div className="_feed_inner_timeline_post_box">
            <div className="_feed_inner_timeline_post_box_image">
              <img src="/assets/images/post_img.png" alt="" className="_post_img" />
            </div>
            <div className="_feed_inner_timeline_post_box_txt">
              <h4 className="_feed_inner_timeline_post_box_title">{post.author}</h4>
              <p className="_feed_inner_timeline_post_box_para">
                {post.time} . <a href="#0">Public</a>
              </p>
            </div>
          </div>
          <div className="_feed_inner_timeline_post_box_dropdown">
            <button type="button" className="_feed_timeline_post_dropdown_link">
              <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
              </svg>
            </button>
          </div>
        </div>
        <h4 className="_feed_inner_timeline_post_title">{post.title}</h4>
        <div className="_feed_inner_timeline_image">
          <img src={post.image} alt="" className="_time_img" />
        </div>
      </div>

      <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26">
        <div className="_feed_inner_timeline_total_reacts_image">
          <img src="/assets/images/react_img1.png" alt="Image" className="_react_img1" />
          <img src="/assets/images/react_img2.png" alt="Image" className="_react_img" />
          <img src="/assets/images/react_img3.png" alt="Image" className="_react_img _rect_img_mbl_none" />
          <img src="/assets/images/react_img4.png" alt="Image" className="_react_img _rect_img_mbl_none" />
          <img src="/assets/images/react_img5.png" alt="Image" className="_react_img _rect_img_mbl_none" />
          <p className="_feed_inner_timeline_total_reacts_para">9+</p>
        </div>
        <div className="_feed_inner_timeline_total_reacts_txt">
          <p className="_feed_inner_timeline_total_reacts_para1"><span>{post.comments}</span> Comment</p>
          <p className="_feed_inner_timeline_total_reacts_para2"><span>{post.shares}</span> Share</p>
        </div>
      </div>

      <div className="_feed_inner_timeline_reaction">
        <button type="button" className="_feed_inner_timeline_reaction_emoji _feed_reaction _feed_reaction_active">
          <span className="_feed_inner_timeline_reaction_link">Haha</span>
        </button>
        <button type="button" className="_feed_inner_timeline_reaction_comment _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">Comment</span>
        </button>
        <button type="button" className="_feed_inner_timeline_reaction_share _feed_reaction">
          <span className="_feed_inner_timeline_reaction_link">Share</span>
        </button>
      </div>

      <div className="_feed_inner_timeline_cooment_area">
        <div className="_feed_inner_comment_box">
          <form className="_feed_inner_comment_box_form">
            <div className="_feed_inner_comment_box_content">
              <div className="_feed_inner_comment_box_content_image">
                <img src="/assets/images/comment_img.png" alt="" className="_comment_img" />
              </div>
              <div className="_feed_inner_comment_box_content_txt">
                <textarea className="form-control _comment_textarea" placeholder="Write a comment" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function RightFriendItem({ friend }) {
  return (
    <div className={`_feed_right_inner_area_card_ppl ${friend.online ? "" : "_feed_right_inner_area_card_ppl_inactive"}`}>
      <div className="_feed_right_inner_area_card_ppl_box">
        <div className="_feed_right_inner_area_card_ppl_image">
          <a href="profile.html">
            <img src={friend.image} alt="" className="_box_ppl_img" />
          </a>
        </div>
        <div className="_feed_right_inner_area_card_ppl_txt">
          <a href="profile.html">
            <h4 className="_feed_right_inner_area_card_ppl_title">{friend.name}</h4>
          </a>
          <p className="_feed_right_inner_area_card_ppl_para">{friend.role}</p>
        </div>
      </div>
      <div className="_feed_right_inner_area_card_ppl_side">
        {friend.online ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
            <rect width="12" height="12" x="1" y="1" fill="#0ACF83" stroke="#fff" strokeWidth="2" rx="6" />
          </svg>
        ) : (
          <span>{friend.seen}</span>
        )}
      </div>
    </div>
  );
}
