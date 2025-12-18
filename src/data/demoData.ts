// ============================================
// DEMO DATA FOR REG'S MEMORIAL SITE
// ============================================
// This file contains all placeholder content for demo mode.
// Replace with real data when ready for production.

import type { Memory, FAQItem, LocalPlace, StorySection, SiteConfig } from '../types';

// ============================================
// SITE CONFIGURATION
// ============================================
// TODO: Replace these values with real data for production

export const siteConfig: SiteConfig = {
  // TODO: Replace with actual Spotify playlist ID
  spotifyPlaylistId: '0i7ZPZKUhvScw9JSAUYxtb',
  
  eventDetails: {
    // TODO: Update with actual event details
    date: 'Monday, 12th January 2026',
    time: '2:00 PM',
    venue: 'Coogee Legion Club',
    address: '200 Arden St, Coogee NSW 2034',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.4!2d151.2534!3d-33.9204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12b197f42c94cd%3A0x2bca30e2782e7e0!2sCoogee%20Legion%20Club!5e0!3m2!1sen!2sau!4v1734500000000',
    dressCode: 'Relaxed and comfortable — think coastal casual. No need for anything formal.',
    description: 'An informal gathering to celebrate Reg\'s life. Come as you are, stay as long as you like, and share in the memories.'
  },
  
  polaroidService: {
    // TODO: Replace with actual image transformation endpoint
    endpoint: '/api/transform-polaroid',
    prompt: `Using the uploaded image as the main content, generate a single classic Polaroid-style instant photograph: off-white paper border with a thicker bottom margin, soft film grain, slightly muted colours, gentle warm tone, subtle vignette. Keep the people and composition from the original image, no stickers or text, straight-on view of the Polaroid, ready to place on a digital collage wall.

Keep the background of the final output TRANSPARENT outside the Polaroid frame. Do NOT simulate transparency with a grey checkerboard.
Crop the final image tightly to the outer edge of the Polaroid frame, so the export is just the full Polaroid and nothing else.`
  },
  
  // TODO: Replace with actual assistant endpoint when ready
  assistantEndpoint: '/api/assistant',
  
  isDemoMode: false
};

// ============================================
// HERO SECTION CONTENT
// ============================================
export const heroContent = {
  // TODO: Replace with actual image URL
  heroImageUrl: '/images/reg-hero.jpg',
  heroImageAlt: 'Reg Fulmer smiling at the beach',
  headline: 'Celebrating the Life of Reg Fulmer',
  subheadline: 'Robert. Reg. Reggie. Pickles. The bloke who never met a stranger.',
  introParagraph: `This isn't a formal church service. It's a relaxed get together by the beach to remember Reg the way he would have wanted: with stories, laughs, a few tears, and a drink in hand. Come for a chat, share a memory, or just take a quiet moment.`
};

// ============================================
// HIS STORY SECTIONS
// ============================================
export const storySections: StorySection[] = [
  {
    id: 'early-life',
    title: 'The Early Days',
    icon: '🌅',
    content: `Reg grew up in a time when kids made their own fun and neighbours were family. From his earliest days, he had that spark — the curiosity, the cheekiness, and an uncanny ability to talk to anyone about anything. He learned early that life was meant to be lived fully, and he never forgot that lesson.`
  },
  {
    id: 'family',
    title: 'Family & Mates',
    icon: '❤️',
    content: `To know Reg was to be welcomed into his world. Family wasn't just blood to him — it was the mates he'd known for decades, the neighbours he'd yarn with over the fence, and the countless people whose lives he touched along the way. He was the glue that held people together, always checking in, always showing up.`
  },
  {
    id: 'connections',
    title: 'The Connector',
    icon: '🤝',
    content: `Dad had this uncanny ability to bump into someone he knew absolutely everywhere he went. A trip to the shops would take three hours because he'd stop to chat with half the suburb. "You wouldn't bloody read about it," he'd say, after running into an old mate in the most random place imaginable. He kept in touch with people from every chapter of his life, and his phone was always buzzing with someone checking in.`
  },
  {
    id: 'anecdotes',
    title: 'Classic Reg Moments',
    icon: '😄',
    content: `There are too many "you had to be there" stories to count. The time he convinced a whole table of strangers they'd met before (they hadn't). His legendary ability to find the one person at any event who needed a chat. The way he'd greet everyone like they were his best mate — because to him, they probably were. He left a trail of smiles wherever he went.`
  },
  {
    id: 'ocean',
    title: 'The Coast & The Pool',
    icon: '🌊',
    content: `Reg was a creature of the coast. Whether it was his beloved ocean pools, a morning dip at Coogee, or just sitting and watching the waves, the sea was his happy place. He understood that some of life's best conversations happen while you're floating in the water or warming up on the rocks afterwards. The coast was his church, his therapy, and his joy.`
  }
];

// ============================================
// SPOTIFY SECTION CONTENT
// ============================================
export const spotifyContent = {
  heading: 'Songs Dad Wanted Played at His Memorial',
  description: `These are the songs Dad specifically chose for his memorial. Press play, pour yourself a drink, and remember him your way. Feel free to keep the music going while you browse, he would have wanted that.`,
  note: '🎵 Music plays in the background while you explore the site'
};

// ============================================
// DEMO MEMORIES FOR POLAROID WALL
// ============================================
export const demoMemories: Memory[] = [
  {
    id: '1',
    name: 'Sarah Mitchell',
    relationship: 'Niece',
    message: `Uncle Reg always made Christmas special. He'd arrive with that huge grin, arms full of presents he'd wrapped terribly but picked perfectly. He remembered every kid's name, every birthday, every little detail about our lives. That's just who he was.`,
    createdAt: new Date('2024-12-10'),
    approved: true,
    rotation: -3
  },
  {
    id: '2',
    name: 'Dave Thompson',
    relationship: 'Mate from the pool',
    message: `Reg and I swam together at Wylie's for fifteen years. Rain, shine, or freezing cold — he'd be there. We solved all the world's problems in that pool. Miss you, mate.`,
    createdAt: new Date('2024-12-11'),
    approved: true,
    rotation: 2
  },
  {
    id: '3',
    name: 'Jenny & Mark',
    relationship: 'Neighbours',
    message: `Reg was the best neighbour anyone could ask for. Always popping over for a yarn, always there if you needed a hand. He watched our kids grow up and they adored him. Our street won't be the same.`,
    createdAt: new Date('2024-12-09'),
    approved: true,
    rotation: -1
  },
  {
    id: '4',
    name: 'Michael Fulmer',
    relationship: 'Son',
    message: `Dad taught me that the best things in life are simple: a good swim, a long chat, showing up for people, and never taking yourself too seriously. I hope I can be half the man you were.`,
    createdAt: new Date('2024-12-12'),
    approved: true,
    rotation: 4
  },
  {
    id: '5',
    name: 'Anonymous',
    relationship: undefined,
    message: `I only met Reg once, at a café in Coogee. We ended up chatting for an hour like old friends. He told me about his grandkids, gave me advice about life, and made my whole week better. That was the kind of person he was.`,
    imageUrl: undefined,
    polaroidUrl: undefined,
    createdAt: new Date('2024-12-08'),
    approved: true,
    rotation: -2
  },
  {
    id: '6',
    name: 'The Johnsons',
    relationship: 'Family friends',
    message: `Every barbecue was better with Reg there. He'd man the grill, tell stories that had everyone in stitches, and somehow know exactly when someone needed their glass topped up. A true entertainer and an even better friend.`,
    createdAt: new Date('2024-12-07'),
    approved: true,
    rotation: 1
  },
  {
    id: '7',
    name: 'Carol Henderson',
    relationship: 'Old colleague',
    message: `Worked with Reg for twelve years and he made every day better. Morning tea was never boring, and he could talk to anyone about anything. The office never quite felt the same after he retired.`,
    createdAt: new Date('2024-12-06'),
    approved: true,
    rotation: -4
  },
  {
    id: '8',
    name: 'Tom & Lisa',
    relationship: 'Coogee locals',
    message: `Reg was a Coogee institution. You'd see him everywhere — the beach, the shops, the pub. Always with a wave and a smile. This place is losing one of its finest.`,
    imageUrl: undefined,
    polaroidUrl: undefined,
    createdAt: new Date('2024-12-05'),
    approved: true,
    rotation: 3
  }
];

// ============================================
// FAQ CONTENT
// ============================================
export const faqItems: FAQItem[] = [
  {
    id: 'what-kind',
    question: 'What kind of event is this?',
    answer: `This is an informal celebration of Reg's life — not a formal sit-down service or traditional wake. Think of it as a gathering of family and friends coming together to share stories, have a drink, and remember the man we all loved. You can come and go as you please, mingle, and connect with others who knew him.`
  },
  {
    id: 'dress-code',
    question: 'What should I wear?',
    answer: `Comfortable and relaxed is the way to go. Think coastal casual — no suits or formal attire required. Reg wouldn't want anyone uncomfortable on his account. Just come as yourself.`
  },
  {
    id: 'food-drinks',
    question: 'Will there be food and drinks?',
    answer: `Yes! There'll be light finger food and drinks available, especially around the time when a few words are shared. The exact details are still being finalised, but we'll make sure no one goes hungry or thirsty.`
  },
  {
    id: 'bring-family',
    question: 'Can I bring my kids or partner?',
    answer: `Absolutely. This is a family-friendly celebration, and everyone is welcome. Reg loved nothing more than being surrounded by people of all ages.`
  },
  {
    id: 'share-memory',
    question: 'Can I share a story or memory?',
    answer: `We'd love that! You can use the "Share a Memory" section on this site to write something and even upload a photo. These memories will appear on our Polaroid wall for everyone to see and cherish.`
  },
  {
    id: 'running-order',
    question: 'Will there be a formal running order?',
    answer: `Not really — and that's intentional. The day is meant to feel easy-going and not overly structured. There will likely be a few planned words and stories shared at some point, but mostly it's about mingling, connecting, and remembering Reg in your own way.`
  },
  {
    id: 'parking',
    question: 'Is there parking nearby?',
    answer: `There's street parking available on Arden Street and surrounding streets. The venue is also close to the Coogee Beach car park. We'd suggest arriving a little early to find a spot, especially if it's a busy beach day.`
  },
  {
    id: 'public-transport',
    question: 'How do I get there by public transport?',
    answer: `Bus services run regularly from Sydney CBD to Coogee. Routes like the 372, 373, and 374 service the area. We'd recommend using the Transport NSW Trip Planner for live times and the best route from where you're coming.`
  },
  {
    id: 'cant-attend',
    question: "What if I can't attend in person?",
    answer: `We understand not everyone can make it. Please feel free to share a memory or message through this site — it means a lot to the family and ensures your words are part of the celebration even if you can't be there physically.`
  }
];

// ============================================
// LOCAL PLACES AROUND COOGEE
// ============================================
export const localPlaces: LocalPlace[] = [
  {
    id: 'coogee-bay-hotel',
    name: 'Coogee Bay Hotel',
    type: 'bar',
    description: 'Iconic beachside pub with multiple bars, bistro, and ocean views.',
    distance: '5 min walk'
  },
  {
    id: 'coogee-pavilion',
    name: 'Coogee Pavilion',
    type: 'restaurant',
    description: 'Multi-level venue with rooftop bar, restaurants, and great atmosphere.',
    distance: '5 min walk'
  },
  {
    id: 'wylies-baths',
    name: "Wylie's Baths",
    type: 'beach',
    description: 'Historic ocean pool on the cliffs south of Coogee Beach. One of Reg\'s favourites.',
    distance: '10 min walk'
  },
  {
    id: 'coogee-beach',
    name: 'Coogee Beach',
    type: 'beach',
    description: 'Beautiful beach perfect for a walk or swim before or after.',
    distance: '5 min walk'
  },
  {
    id: 'randwick-ritz',
    name: 'The Ritz Cinema Randwick',
    type: 'attraction',
    description: 'Historic art deco cinema if you want to catch a film.',
    distance: '10 min drive'
  },
  {
    id: 'crowne-plaza-coogee',
    name: 'Crowne Plaza Coogee Beach',
    type: 'accommodation',
    description: 'Beachfront hotel with ocean views, right on Coogee Beach.',
    distance: '5 min walk'
  }
];

// ============================================
// ASSISTANT CONFIGURATION
// ============================================
export const assistantConfig = {
  welcomeMessage: `G'day! I'm here to help with anything about Reg's celebration. Whether you need directions, want to know what to wear, or just have questions about the day - I've got you covered. What can I help you with?`,
  
  fallbackMessage: `I'm not sure about that specific detail - some things are still being finalised. But I'd suggest checking back on the website for updates. Is there anything else I can help with?`,
  
  systemPrompt: `You are the "Reg's Celebration of Life" assistant on the website.

Your job:
- Help visitors understand the Celebration of Life details for Robert "Reg" Fulmer.
- Keep the tone warm, calm, plain-English, and practical.
- Be respectful about grief. Keep replies steady and simple.
- Do NOT offer to send SMS, text messages, or provide phone numbers.
- Encourage people to RSVP on the website so organisers can plan for numbers.

CONFIRMED CORE FACTS (treat as source of truth):
- Event: Celebration of Life for Robert "Reg" Fulmer
- Date: Monday 12 January 2026
- Time: 2:00 pm to 5:00 pm (Sydney time)
- Venue: Coogee Legion Club (Coogee Legion Ex-Service Club), Coogee NSW
- Catering: Food and drinks will be provided
- Style: Informal celebration (not a church service, not a chapel service, not a sit-down funeral)
- Flow: One continuous gathering (no separate wake)
- Website: https://www.regfulmer.com/

How to answer:
- Start with the direct answer first, then add helpful context.
- If something is not confirmed (eg exact room, seating, running order, accessibility specifics, menu details, livestream link), say it's not yet confirmed and direct them to check back on the website for updates.
- Do not invent venue specific details. If you cannot verify something, don't guess.

RSVP guidance:
If someone says they're coming, likely coming, or asks logistics, add:
"If you can, please RSVP on the website so we can plan properly for numbers."

What you CAN help with:
- Explain the vibe and what to expect on the day
- Confirm food and drinks are provided (but do not guess the menu)
- What to wear: Smart casual or whatever feels respectful and comfortable
- Whether kids can come: Yes, children are welcome if supervised
- General travel guidance to Coogee and nearby accommodation suggestions
- Parking: Available around Coogee, but exact availability varies
- Accessibility: Being considered, check website for confirmed details
- Weather: Accurate forecasts only available close to the date. Typical January = Sydney summer conditions.

Livestream: A livestream may be organised. If confirmed, the link will be shared on the website.

Can anyone attend? Yes, anyone who knew Reg or wishes to support those who did.

Current event details:
- Date: ${siteConfig.eventDetails.date}
- Time: ${siteConfig.eventDetails.time}
- Venue: ${siteConfig.eventDetails.venue}
- Address: ${siteConfig.eventDetails.address}
- Dress code: ${siteConfig.eventDetails.dressCode}

Be warm, helpful, and embody the same spirit that Reg did - welcoming everyone like an old friend.`
};
