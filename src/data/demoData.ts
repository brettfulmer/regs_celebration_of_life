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
    date: 'Monday, 12th December 2025',
    time: '2:00 PM onwards',
    venue: 'Horizons',
    address: '1R Marine Parade, Maroubra NSW 2035\nSouth Maroubra Surf Life Saving Club',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.683!2d151.2555689!3d-33.9512464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b12b15fac9e6bed%3A0x9a9438b0689cfd71!2sHorizons!5e0!3m2!1sen!2sau!4v1734480000000!5m2!1sen!2sau',
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
  subheadline: 'Robert. Reg. Reggie. Pickles. Dad. Uncle Reggie. Son, Brother. Husband. The bloke who never met a stranger.',
  introParagraph: `This is not a formal church service. It's a chance for all of us to come together and remember Reg the way he would have wanted: with stories, laughs, maybe a few tears, and definitely a drink in hand. It's a space to chat, listen to the music he chose for his memorial, share a memory, or simply take a quiet moment to remember the man who touched so many lives.`
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
    answer: `Street parking is available around Coogee, though it can be busy on weekends. We'd recommend coming early or considering public transport. The venue is also accessible by bus from the city.`
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
    id: 'maroubra-seals',
    name: 'Maroubra Seals',
    type: 'cafe',
    description: 'Popular beachside café serving breakfast and coffee with ocean views.',
    distance: '2 min walk'
  },
  {
    id: 'quickies-maroubra',
    name: "Quickie's Maroubra",
    type: 'bar',
    description: 'Local pub with bistro, perfect for a casual drink and meal.',
    distance: '5 min walk'
  },
  {
    id: 'mahon-pool',
    name: 'Mahon Pool',
    type: 'beach',
    description: 'Iconic ocean rock pool just north of the venue, great for a morning swim.',
    distance: '8 min walk'
  },
  {
    id: 'maroubra-beach',
    name: 'Maroubra Beach',
    type: 'beach',
    description: 'Beautiful stretch of beach perfect for a walk or swim.',
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
    id: 'quest-maroubra',
    name: 'Quest Maroubra Beach',
    type: 'accommodation',
    description: 'Modern serviced apartments right near the beach.',
    distance: '5 min walk'
  }
];

// ============================================
// ASSISTANT CONFIGURATION
// ============================================
export const assistantConfig = {
  welcomeMessage: `G'day! I'm here to help with anything about Reg's celebration. Whether you need directions, want to know what to wear, or just have questions about the day — I've got you covered. What can I help you with?`,
  
  fallbackMessage: `I'm not sure about that specific detail — some things are still being finalised. But I'd suggest reaching out to the family directly if you need a definite answer. Is there anything else I can help with?`,
  
  systemPrompt: `You are an on-page assistant for a memorial website celebrating the life of Reg Fulmer.

Your job is to:
– Help guests understand the tone of the event (a relaxed celebration, not a formal wake).
– Provide clear, kind answers about basic logistics: date, time, location, dress, general flow.
– Suggest helpful information related to the celebration:
   • What the weather may be like in Coogee/Maroubra on the day (using a weather service).
   • Transport, parking, and nearby accommodation options.
   • Things to do around Coogee and Maroubra before or after the event.
– Answer questions gently and calmly, never pushy or salesy.
– If details are not final or may change, be honest and say they are still being confirmed.
– Reassure people that they can come as they are; the focus is remembering Reg in a warm, informal way.

Important constraints:
• Never refer to the event as a "formal service" or "wake" unless explicitly asked and you need to clarify that it's more of a celebration.
• It is acceptable to say something like: "It's a relaxed celebration where people can stand, mingle, listen to some words being shared, and have a drink or some food while they remember Reg."

Current event details:
- Date: Monday, 12th December 2025
- Time: 2:00 PM onwards
- Venue: Horizons
- Address: 1R Marine Parade, Maroubra NSW 2035, South Maroubra Surf Life Saving Club
- Dress code: Relaxed and comfortable — think coastal casual. No need for anything formal.

Be warm, helpful, and embody the same spirit that Reg did — welcoming everyone like an old friend.`
};
