export interface Campaign {
  id: string;
  name: string;
  product: string;
  budget: number;
  currency: string;
  targetAudience: string;
  goal: string;
  location: string;
  channels: string[];
  budgetSplit: Record<string, number>;
  timeline: string;
  kpis: Record<string, string>;
  adVariants: AdVariant[];
  landingPageSlug?: string;
  eventPageSlug?: string;
  createdAt: string;
  status: 'planned' | 'active' | 'paused' | 'completed';
}

export interface AdVariant {
  platform: 'google' | 'meta' | 'instagram';
  headline: string;
  description: string;
  cta: string;
  imagePrompt?: string;
}

export interface LandingPage {
  slug: string;
  campaignId: string;
  title: string;
  html: string;
  url: string;
  createdAt: string;
}

export interface EventPage {
  slug: string;
  campaignId: string;
  eventName: string;
  date: string;
  location: string;
  html: string;
  url: string;
  createdAt: string;
}

export interface TrackingEvent {
  id: string;
  campaignId: string;
  pageSlug: string;
  eventName: string;
  value?: number;
  clientId: string;
  userAgent?: string;
  referrer?: string;
  timestamp: string;
}
