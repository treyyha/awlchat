export interface CampaignTemplate {
  slug: string;
  title: string;
  category: string;
  audience: string;
  summary: string;
  goal: string;
  keywords: string[];
  dmMessage: string;
  triggerExample: string;
  privateReplyPreview: string;
  setupMinutes: number;
  outcome: string;
  bestFor: string[];
  playbook: string[];
  metrics: string[];
  accent: "cyan" | "emerald" | "rose" | "amber";
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    slug: "freebie-drop",
    title: "Freebie Drop",
    category: "Lead magnet",
    audience: "Creators and coaches",
    summary:
      "Turn comments like FREE, GUIDE, or SEND into a DM with your checklist, swipe file, or starter kit.",
    goal: "Lead magnet delivery",
    keywords: ["FREE", "GUIDE", "SEND"],
    dmMessage:
      "Hey {username}, here is the free guide from this reel: https://yoursite.com/freebie {link}",
    triggerExample: "SEND",
    privateReplyPreview:
      "Hey Maya, here is the free guide from this reel: yoursite.com/freebie",
    setupMinutes: 3,
    outcome: "Move high-intent commenters onto your list instead of leaving them in the comments.",
    bestFor: ["Tutorial reels", "Hook-and-value carousels", "Pinned freebie posts"],
    playbook: [
      "Ask for one keyword in the caption and on-screen text.",
      "Deliver exactly what you promised in the reel, in the first line of the DM.",
      "Put the download or landing page on a tracked link.",
      "Follow up later with your paid offer only after the freebie is sent.",
    ],
    metrics: ["Sent replies", "Freebie clicks", "Email or list opt-ins"],
    accent: "cyan",
  },
  {
    slug: "digital-offer-link",
    title: "Digital Offer Link",
    category: "Creator commerce",
    audience: "Creators selling products",
    summary:
      "Send the exact product, template pack, or checkout page when someone comments LINK, SHOP, or BUY.",
    goal: "Product link request",
    keywords: ["LINK", "SHOP", "BUY"],
    dmMessage:
      "Hey {username}, here is the offer from this video: https://yoursite.com/offer {link}",
    triggerExample: "LINK",
    privateReplyPreview:
      "Hey Jordan, here is the offer from this video: yoursite.com/offer",
    setupMinutes: 4,
    outcome: "Catch buyers who will never open your bio while the reel is still circulating.",
    bestFor: ["Product demos", "Unboxing or teardown reels", "Limited drops"],
    playbook: [
      "Attach the campaign to the reel that shows the product in use.",
      "Use LINK as the caption prompt and SHOP / BUY as fallbacks.",
      "Keep the DM to one benefit line plus the tracked URL.",
      "Compare CTR across posts to see which hooks actually sell.",
    ],
    metrics: ["Sent replies", "Offer CTR", "Checkout visits"],
    accent: "emerald",
  },
  {
    slug: "waitlist-launch",
    title: "Waitlist Launch",
    category: "Launches",
    audience: "Course and product founders",
    summary:
      "Collect waitlist signups when followers comment WAITLIST, DROP, or EARLY on a launch teaser.",
    goal: "Launch waitlist",
    keywords: ["WAITLIST", "DROP", "EARLY"],
    dmMessage:
      "Hey {username}, you are on the list path — join here for early access: https://yoursite.com/waitlist {link}",
    triggerExample: "WAITLIST",
    privateReplyPreview:
      "Hey Sam, join here for early access: yoursite.com/waitlist",
    setupMinutes: 4,
    outcome: "Turn launch hype into a list you can email on open day.",
    bestFor: ["Coming soon reels", "Founding-price posts", "Cohort announcements"],
    playbook: [
      "Use this on teaser content before the cart opens, not after.",
      "Promise one concrete perk for joining early.",
      "Send a single waitlist page, not a long pitch in the DM.",
      "Pause or switch the campaign to the checkout link when you go live.",
    ],
    metrics: ["Waitlist clicks", "DM sends", "Launch-day conversions"],
    accent: "amber",
  },
  {
    slug: "discovery-call",
    title: "Discovery Call Booker",
    category: "Services",
    audience: "Consultants and coaches",
    summary:
      "Send your calendar or application when someone comments CALL, BOOK, or APPLY after a results or process reel.",
    goal: "Book a call",
    keywords: ["CALL", "BOOK", "APPLY"],
    dmMessage:
      "Hey {username}, grab a time that works and I will send the prep notes after you book: https://yoursite.com/call {link}",
    triggerExample: "BOOK",
    privateReplyPreview:
      "Hey Alex, grab a time that works: yoursite.com/call",
    setupMinutes: 5,
    outcome: "Fill the calendar from comments instead of asking people to DM you first.",
    bestFor: ["Case-study reels", "Offer breakdowns", "Client result posts"],
    playbook: [
      "Qualify in the caption so only serious people comment the keyword.",
      "Send a calendar or short application, not both in one DM.",
      "Mention what happens after they book so no-shows drop.",
      "Review skipped logs — repeats often mean your CTA is too broad.",
    ],
    metrics: ["Booking link clicks", "Calls booked", "Show-up rate"],
    accent: "rose",
  },
  {
    slug: "newsletter-community",
    title: "Newsletter Or Community",
    category: "Audience growth",
    audience: "Creators building a list",
    summary:
      "Invite commenters into your newsletter, Skool, or Circle when they comment LIST, JOIN, or INSIDE.",
    goal: "Community signup",
    keywords: ["LIST", "JOIN", "INSIDE"],
    dmMessage:
      "Hey {username}, here is the door in — weekly notes and the private community: https://yoursite.com/join {link}",
    triggerExample: "JOIN",
    privateReplyPreview:
      "Hey Riley, here is the door in: yoursite.com/join",
    setupMinutes: 3,
    outcome: "Own the relationship off Instagram before the algorithm moves on.",
    bestFor: ["Value series", "Behind-the-scenes", "Weekly newsletter plugs"],
    playbook: [
      "Tell them what they get in the first week, not a vague “join my list.”",
      "Use JOIN on community posts and LIST on newsletter posts if you split them.",
      "Send one destination so you can track which reels grow the list.",
      "Keep a public reply variation that thanks them without repeating the full pitch.",
    ],
    metrics: ["Join clicks", "New subscribers", "Replies per post"],
    accent: "cyan",
  },
  {
    slug: "live-workshop",
    title: "Live Workshop Invite",
    category: "Education",
    audience: "Educators and course sellers",
    summary:
      "Send the registration link when someone comments LIVE, CLASS, or WEBINAR on a teaching reel.",
    goal: "Workshop registration",
    keywords: ["LIVE", "CLASS", "WEBINAR"],
    dmMessage:
      "Hey {username}, here is the free workshop registration (date is on the page): https://yoursite.com/workshop {link}",
    triggerExample: "LIVE",
    privateReplyPreview:
      "Hey Casey, here is the free workshop registration: yoursite.com/workshop",
    setupMinutes: 4,
    outcome: "Convert teaching reach into registrations you can remarket.",
    bestFor: ["Mini trainings", "Launch workshops", "AMA recap reels"],
    playbook: [
      "Put the keyword on screen in the last three seconds of the reel.",
      "Include date and timezone on the landing page, not only in the DM.",
      "Use one primary keyword so comments stay scannable.",
      "After the event, change the link to the replay or the paid offer.",
    ],
    metrics: ["Registrations", "DM sends", "Replay clicks"],
    accent: "amber",
  },
  {
    slug: "brand-collab-kit",
    title: "Brand Collab Kit",
    category: "Partnerships",
    audience: "Creators pitching brands",
    summary:
      "Send your media kit, rate card, or partnership form when brands comment COLLAB, KIT, or RATES.",
    goal: "Partnership inquiry",
    keywords: ["COLLAB", "KIT", "RATES"],
    dmMessage:
      "Hey {username}, here is my media kit and the form to start a partnership: https://yoursite.com/kit {link}",
    triggerExample: "COLLAB",
    privateReplyPreview:
      "Hey Morgan, here is my media kit and partnership form.",
    setupMinutes: 4,
    outcome: "Capture inbound brand interest without sending people hunting through your bio.",
    bestFor: ["Portfolio reels", "Case-study posts", "Pinned collab CTAs"],
    playbook: [
      "Pin a reel that shows proof, not a generic “open to collabs” story.",
      "Use keywords brands actually type: COLLAB, KIT, RATES.",
      "Send the kit plus one qualifying question in the opening DM if you use a button.",
      "Review DMs weekly and move qualified brands into your pipeline.",
    ],
    metrics: ["Kit clicks", "Qualified inquiries", "Partnership DMs"],
    accent: "emerald",
  },
  {
    slug: "content-os-stack",
    title: "Content OS Stack",
    category: "Tools and systems",
    audience: "Creator-entrepreneurs",
    summary:
      "DM the Notion board, swipe file, or automation stack you showed on camera when they comment STACK, TEMPLATE, or TOOLS.",
    goal: "System download",
    keywords: ["STACK", "TEMPLATE", "TOOLS"],
    dmMessage:
      "Hey {username}, here is the exact stack from this video: https://yoursite.com/stack {link}",
    triggerExample: "STACK",
    privateReplyPreview:
      "Hey Taylor, here is the exact stack from this video: yoursite.com/stack",
    setupMinutes: 4,
    outcome: "Monetize “what do you use?” comments instead of answering them one by one.",
    bestFor: ["Setup tours", "Workflow reels", "Tool roundups"],
    playbook: [
      "Show the system on screen, then tell them the one keyword to comment.",
      "Link to a page that lists what is included before the paywall or opt-in.",
      "If the stack is free, still use a tracked link so you see which reels convert.",
      "Swap the destination when you update the template without changing keywords.",
    ],
    metrics: ["Stack clicks", "Template sales or opt-ins", "Sends per reel"],
    accent: "rose",
  },
];

export function getCampaignTemplate(slug: string | null | undefined) {
  if (!slug) return null;
  return CAMPAIGN_TEMPLATES.find((template) => template.slug === slug) ?? null;
}

export function getCampaignTemplateSlugs() {
  return CAMPAIGN_TEMPLATES.map((template) => template.slug);
}
