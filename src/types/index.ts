// ============================================
// TYPE DEFINITIONS FOR REG'S MEMORIAL SITE
// ============================================

export interface Memory {
  id: string;
  name: string;
  relationship?: string;
  message: string;
  imageUrl?: string;
  polaroidUrl?: string; // Transformed Polaroid image
  createdAt: Date;
  approved: boolean;
  rotation: number; // Random rotation for gallery effect (-5 to 5 degrees)
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface EventDetails {
  date: string; // e.g., "Saturday, 25th January 2025"
  time: string; // e.g., "2:00 PM - 6:00 PM"
  venue: string;
  address: string;
  mapEmbedUrl?: string;
  dressCode: string;
  description: string;
}

export interface LocalPlace {
  id: string;
  name: string;
  type: 'cafe' | 'bar' | 'restaurant' | 'accommodation' | 'beach' | 'attraction';
  description: string;
  distance?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export interface StorySection {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

export interface TimelineItem {
  id: string;
  when: string;
  where: string;
  title: string;
  body: string;
}

// Configuration for the Polaroid image transformation service
export interface PolaroidServiceConfig {
  endpoint: string;
  prompt: string;
}

// Site configuration - easy to swap demo/production values
export interface SiteConfig {
  spotifyPlaylistId: string;
  eventDetails: EventDetails;
  polaroidService: PolaroidServiceConfig;
  assistantEndpoint?: string;
  isDemoMode: boolean;
}
