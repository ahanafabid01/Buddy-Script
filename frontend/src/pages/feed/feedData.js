export const TEMPLATE_PAGE_ROUTE_MAP = {
  "feed.html": "/feed",
  "login.html": "/login",
  "register.html": "/register",
  "registration.html": "/register",
  "friend-request.html": "/feed",
  "chat.html": "/feed",
  "profile.html": "/feed",
  "find-friends.html": "/feed",
  "group.html": "/feed",
  "event.html": "/feed",
  "event-single.html": "/feed",
};

export const NAV_ITEMS = [
  { id: "home", href: "feed.html", label: "Home", count: null, active: true },
  { id: "friends", href: "friend-request.html", label: "Friends", count: null, active: false },
  { id: "chat", href: "chat.html", label: "Chat", count: 2, active: false },
];

export const NOTIFICATIONS = Array.from({ length: 14 }).map((_, index) => {
  const isGroup = index % 2 === 1;
  return {
    id: `notif-${index + 1}`,
    image: isGroup ? "/assets/images/profile-1.png" : "/assets/images/friend-req.png",
    isGroup,
    name: "Steve Jobs",
    groupFrom: "Freelacer usa",
    groupTo: "Freelacer usa",
    time: "42 miniutes ago",
  };
});

export const SUGGESTED_LEFT = [
  { id: "left-1", name: "Steve Jobs", role: "CEO of Apple", image: "/assets/images/people1.png", large: true },
  { id: "left-2", name: "Ryan Roslansky", role: "CEO of Linkedin", image: "/assets/images/people2.png", large: false },
  { id: "left-3", name: "Dylan Field", role: "CEO of Figma", image: "/assets/images/people3.png", large: false },
];

export const EVENTS = [
  { id: "event-1", title: "No more terrorism no more cry", image: "/assets/images/feed_event1.png", day: "10", month: "Jul", going: "17 People Going" },
  { id: "event-2", title: "No more terrorism no more cry", image: "/assets/images/feed_event1.png", day: "10", month: "Jul", going: "17 People Going" },
];

export const STORIES_DESKTOP = [
  { id: "story-1", image: "/assets/images/card_ppl2.png", name: "Ryan Roslansky" },
  { id: "story-2", image: "/assets/images/card_ppl3.png", name: "Ryan Roslansky" },
  { id: "story-3", image: "/assets/images/card_ppl4.png", name: "Ryan Roslansky" },
];

export const STORIES_MOBILE = [
  { id: "m-story-1", image: "/assets/images/mobile_story_img.png", yourStory: true, active: false },
  { id: "m-story-2", image: "/assets/images/mobile_story_img1.png", yourStory: false, active: true },
  { id: "m-story-3", image: "/assets/images/mobile_story_img2.png", yourStory: false, active: false },
  { id: "m-story-4", image: "/assets/images/mobile_story_img1.png", yourStory: false, active: true },
  { id: "m-story-5", image: "/assets/images/mobile_story_img2.png", yourStory: false, active: false },
  { id: "m-story-6", image: "/assets/images/mobile_story_img.png", yourStory: false, active: false },
];

export const POSTS = [
  { id: "post-1", author: "Karim Saif", time: "5 minute ago", title: "-Healthy Tracking App", image: "/assets/images/timeline_img.png", comments: 12, shares: 122 },
  { id: "post-2", author: "Karim Saif", time: "5 minute ago", title: "-Healthy Tracking App", image: "/assets/images/timeline_img.png", comments: 12, shares: 122 },
];

export const RIGHT_FRIENDS = [
  { id: "friend-1", name: "Steve Jobs", role: "CEO of Apple", image: "/assets/images/people1.png", online: false, seen: "5 minute ago" },
  { id: "friend-2", name: "Ryan Roslansky", role: "CEO of Linkedin", image: "/assets/images/people2.png", online: true, seen: "" },
  { id: "friend-3", name: "Dylan Field", role: "CEO of Figma", image: "/assets/images/people3.png", online: true, seen: "" },
  { id: "friend-4", name: "Steve Jobs", role: "CEO of Apple", image: "/assets/images/people1.png", online: false, seen: "5 minute ago" },
  { id: "friend-5", name: "Ryan Roslansky", role: "CEO of Linkedin", image: "/assets/images/people2.png", online: true, seen: "" },
  { id: "friend-6", name: "Dylan Field", role: "CEO of Figma", image: "/assets/images/people3.png", online: true, seen: "" },
  { id: "friend-7", name: "Dylan Field", role: "CEO of Figma", image: "/assets/images/people3.png", online: true, seen: "" },
  { id: "friend-8", name: "Steve Jobs", role: "CEO of Apple", image: "/assets/images/people1.png", online: false, seen: "5 minute ago" },
];
