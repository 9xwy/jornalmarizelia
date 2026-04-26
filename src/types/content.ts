export type ContentStatus = "draft" | "published";

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  coverImageUrl: string | null;
  coverTone: string;
  featured: boolean;
  status: ContentStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string | null;
  coverTone: string;
  featured: boolean;
  status: ContentStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  highlight: boolean;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StudentWorkItem {
  id: string;
  slug: string;
  title: string;
  workType: string;
  author: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverTone: string;
  featured: boolean;
  status: ContentStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notice {
  id: string;
  noticeType: string;
  icon: string;
  title: string;
  description: string;
  pinned: boolean;
  status: ContentStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  displayOrder: number;
}

export interface Poll {
  id: string;
  question: string;
  description: string;
  isActive: boolean;
  closesAt: string | null;
  options: PollOption[];
  createdAt: string;
  updatedAt: string;
}

export interface PollResult {
  poll: Poll;
  source: "demo" | "supabase" | "temporary";
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  heroTagline: string;
  schoolName: string;
  schoolAddress: string;
  contactEmail: string;
  contactPhone: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  editorialTeam: string[];
  copyrightText: string;
  updatedAt?: string;
}

export interface NewsArticleInput {
  id?: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  coverImageUrl: string;
  coverTone: string;
  featured: boolean;
  status: ContentStatus;
  publishedAt: string;
}

export interface GalleryItemInput {
  id?: string;
  title: string;
  caption: string;
  category: string;
  imageUrl: string;
  coverTone: string;
  featured: boolean;
  status: ContentStatus;
  publishedAt: string;
}

export interface CalendarEventInput {
  id?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  eventDate: string;
  highlight: boolean;
  status: ContentStatus;
}

export interface StudentWorkInput {
  id?: string;
  slug: string;
  title: string;
  workType: string;
  author: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverTone: string;
  featured: boolean;
  status: ContentStatus;
  publishedAt: string;
}

export interface NoticeInput {
  id?: string;
  noticeType: string;
  icon: string;
  title: string;
  description: string;
  pinned: boolean;
  status: ContentStatus;
  publishedAt: string;
}

export interface PollOptionInput {
  id?: string;
  label: string;
  votes: number;
}

export interface PollInput {
  id?: string;
  question: string;
  description: string;
  isActive: boolean;
  closesAt: string;
  options: PollOptionInput[];
}

export type SiteSettingsInput = SiteSettings;

export interface SupabaseSetupStatus {
  configured: boolean;
  healthy: boolean;
  missingSchema: boolean;
  message: string;
}
