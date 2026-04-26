import type { PostgrestError } from "@supabase/supabase-js";
import {
  demoCalendarEvents,
  demoGalleryItems,
  demoNewsArticles,
  demoNotices,
  demoPoll,
  demoStudentWorks,
} from "@/data/content";
import {
  normalizeTone,
  validateCalendarEventInput,
  validateGalleryItemInput,
  validateNewsArticleInput,
  validateNoticeInput,
  validatePollInput,
  validateStudentWorkInput,
} from "@/lib/content-validation";
import { sanitizeExternalUrl, sanitizeMultilineText, sanitizeSingleLineText } from "@/lib/security";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import {
  createDefaultTemporaryContentStore,
  ensureTemporaryContentStore,
  hasTemporaryAdminSession,
  readTemporaryContentStore,
  tempAdminEnabled,
  type TemporaryContentStore,
  writeTemporaryContentStore,
} from "@/lib/temp-admin";
import type {
  CalendarEvent,
  CalendarEventInput,
  GalleryItem,
  GalleryItemInput,
  NewsArticle,
  NewsArticleInput,
  Notice,
  NoticeInput,
  Poll,
  PollInput,
  PollOption,
  PollResult,
  StudentWorkInput,
  StudentWorkItem,
  SupabaseSetupStatus,
} from "@/types/content";

export const queryKeys = {
  news: ["news"] as const,
  newsBySlug: (slug: string) => ["news", slug] as const,
  gallery: ["gallery"] as const,
  events: ["events"] as const,
  works: ["works"] as const,
  workBySlug: (slug: string) => ["works", slug] as const,
  notices: ["notices"] as const,
  poll: ["poll"] as const,
  setup: ["supabase-setup"] as const,
  adminNews: ["admin", "news"] as const,
  adminGallery: ["admin", "gallery"] as const,
  adminEvents: ["admin", "events"] as const,
  adminWorks: ["admin", "works"] as const,
  adminNotices: ["admin", "notices"] as const,
  adminPolls: ["admin", "polls"] as const,
};

type NewsRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  author_name: string;
  cover_image_url: string | null;
  cover_tone: string | null;
  featured: boolean | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type GalleryRow = {
  id: string;
  title: string;
  caption: string | null;
  category: string;
  image_url: string | null;
  cover_tone: string | null;
  featured: boolean | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  event_date: string;
  highlight: boolean | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
};

type WorkRow = {
  id: string;
  slug: string;
  title: string;
  work_type: string;
  author_name: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  cover_tone: string | null;
  featured: boolean | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type NoticeRow = {
  id: string;
  notice_type: string;
  icon: string;
  title: string;
  description: string;
  pinned: boolean | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

type PollOptionRow = {
  id: string;
  label: string;
  votes_count: number | null;
  display_order: number | null;
};

type PollRow = {
  id: string;
  question: string;
  description: string | null;
  is_active: boolean | null;
  closes_at: string | null;
  created_at: string;
  updated_at: string;
  poll_options?: PollOptionRow[] | null;
};

class SupabaseConfigError extends Error {}

function requireSupabase() {
  if (!supabase) {
    throw new SupabaseConfigError(
      "As variaveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ainda nao estao disponiveis.",
    );
  }

  return supabase;
}

function isMissingSchemaError(error: PostgrestError | null) {
  return Boolean(error && ["42P01", "PGRST205", "PGRST116"].includes(error.code ?? ""));
}

function normalizeDate(value: string | null | undefined, fallback: string) {
  return value ?? fallback;
}

function mapNewsRow(row: NewsRow): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: sanitizeSingleLineText(row.title, 160),
    category: sanitizeSingleLineText(row.category, 40),
    summary: sanitizeMultilineText(row.summary, 320),
    content: sanitizeMultilineText(row.content, 20000),
    author: sanitizeSingleLineText(row.author_name, 80),
    coverImageUrl: sanitizeExternalUrl(row.cover_image_url),
    coverTone: normalizeTone(row.cover_tone),
    featured: Boolean(row.featured),
    status: row.status,
    publishedAt: normalizeDate(row.published_at, row.created_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapGalleryRow(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    title: sanitizeSingleLineText(row.title, 160),
    caption: sanitizeMultilineText(row.caption ?? "", 500),
    category: sanitizeSingleLineText(row.category, 60),
    imageUrl: sanitizeExternalUrl(row.image_url),
    coverTone: normalizeTone(row.cover_tone),
    featured: Boolean(row.featured),
    status: row.status,
    publishedAt: normalizeDate(row.published_at, row.created_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEventRow(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: sanitizeSingleLineText(row.title, 160),
    description: sanitizeMultilineText(row.description ?? "", 1200),
    category: sanitizeSingleLineText(row.category, 60),
    location: sanitizeSingleLineText(row.location ?? "", 160),
    eventDate: row.event_date,
    highlight: Boolean(row.highlight),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWorkRow(row: WorkRow): StudentWorkItem {
  return {
    id: row.id,
    slug: row.slug,
    title: sanitizeSingleLineText(row.title, 160),
    workType: sanitizeSingleLineText(row.work_type, 40),
    author: sanitizeSingleLineText(row.author_name, 80),
    excerpt: sanitizeMultilineText(row.excerpt, 400),
    content: sanitizeMultilineText(row.content, 25000),
    coverImageUrl: sanitizeExternalUrl(row.cover_image_url),
    coverTone: normalizeTone(row.cover_tone),
    featured: Boolean(row.featured),
    status: row.status,
    publishedAt: normalizeDate(row.published_at, row.created_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapNoticeRow(row: NoticeRow): Notice {
  return {
    id: row.id,
    noticeType: sanitizeSingleLineText(row.notice_type, 40),
    icon: sanitizeSingleLineText(row.icon, 40),
    title: sanitizeSingleLineText(row.title, 160),
    description: sanitizeMultilineText(row.description, 800),
    pinned: Boolean(row.pinned),
    status: row.status,
    publishedAt: normalizeDate(row.published_at, row.created_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPollRow(row: PollRow): Poll {
  const options = [...(row.poll_options ?? [])]
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map<PollOption>((option) => ({
      id: option.id,
      label: sanitizeSingleLineText(option.label, 120),
      votes: option.votes_count ?? 0,
      displayOrder: option.display_order ?? 0,
    }));

  return {
    id: row.id,
    question: sanitizeSingleLineText(row.question, 200),
    description: sanitizeMultilineText(row.description ?? "", 500),
    isActive: Boolean(row.is_active),
    closesAt: row.closes_at,
    options,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isoOrNow(value: string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  return new Date(value).toISOString();
}

function datetimeLocalToIso(value: string) {
  if (!value) {
    return new Date().toISOString();
  }

  return new Date(value).toISOString();
}

function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function shouldUseTemporaryAdminSession() {
  return tempAdminEnabled && hasTemporaryAdminSession();
}

function updateTemporaryStore<T>(updater: (store: TemporaryContentStore) => T) {
  const store = ensureTemporaryContentStore();
  const result = updater(store);
  writeTemporaryContentStore(store);
  return result;
}

function sortNewsArticles(items: NewsArticle[]) {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) {
      return Number(b.featured) - Number(a.featured);
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

function sortGalleryItems(items: GalleryItem[]) {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) {
      return Number(b.featured) - Number(a.featured);
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

function sortCalendarEvents(items: CalendarEvent[]) {
  return [...items].sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
}

function sortStudentWorks(items: StudentWorkItem[]) {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) {
      return Number(b.featured) - Number(a.featured);
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

function sortNotices(items: Notice[]) {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return Number(b.pinned) - Number(a.pinned);
    }

    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

function sortPolls(items: Poll[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function fetchSupabaseSetupStatus(): Promise<SupabaseSetupStatus> {
  if (!hasSupabaseEnv) {
    return {
      configured: false,
      healthy: false,
      missingSchema: false,
      message: "Supabase ainda nao foi configurado no ambiente local.",
    };
  }

  const db = requireSupabase();
  const { error } = await db.from("news_posts").select("id").limit(1);

  if (!error) {
    return {
      configured: true,
      healthy: true,
      missingSchema: false,
      message: "Conexao com o Supabase pronta.",
    };
  }

  if (isMissingSchemaError(error)) {
    return {
      configured: true,
      healthy: false,
      missingSchema: true,
      message: "As tabelas do projeto ainda nao existem. Rode o arquivo supabase/schema.sql.",
    };
  }

  return {
    configured: true,
    healthy: false,
    missingSchema: false,
    message: error.message,
  };
}

export async function fetchNewsArticles() {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return sortNewsArticles(temporaryStore.news.filter((article) => article.status === "published"));
  }

  if (!supabase) {
    return demoNewsArticles;
  }

  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    if (isMissingSchemaError(error)) {
      return demoNewsArticles;
    }

    throw error;
  }

  if (!data?.length) {
    return demoNewsArticles;
  }

  return data.map(mapNewsRow);
}

export async function fetchNewsArticleBySlug(slug: string) {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return temporaryStore.news.find((article) => article.slug === slug && article.status === "published") ?? null;
  }

  if (!supabase) {
    return demoNewsArticles.find((article) => article.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("news_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return demoNewsArticles.find((article) => article.slug === slug) ?? null;
    }

    throw error;
  }

  if (!data) {
    return demoNewsArticles.find((article) => article.slug === slug) ?? null;
  }

  return mapNewsRow(data);
}

export async function fetchGalleryItems() {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return sortGalleryItems(temporaryStore.gallery.filter((item) => item.status === "published"));
  }

  if (!supabase) {
    return demoGalleryItems;
  }

  const { data, error } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    if (isMissingSchemaError(error)) {
      return demoGalleryItems;
    }

    throw error;
  }

  if (!data?.length) {
    return demoGalleryItems;
  }

  return data.map(mapGalleryRow);
}

export async function fetchCalendarEvents() {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return sortCalendarEvents(temporaryStore.events.filter((item) => item.status === "published"));
  }

  if (!supabase) {
    return demoCalendarEvents;
  }

  const { data, error } = await supabase
    .from("calendar_events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true });

  if (error) {
    if (isMissingSchemaError(error)) {
      return demoCalendarEvents;
    }

    throw error;
  }

  if (!data?.length) {
    return demoCalendarEvents;
  }

  return data.map(mapEventRow);
}

export async function fetchStudentWorks() {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return sortStudentWorks(temporaryStore.works.filter((work) => work.status === "published"));
  }

  if (!supabase) {
    return demoStudentWorks;
  }

  const { data, error } = await supabase
    .from("student_works")
    .select("*")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    if (isMissingSchemaError(error)) {
      return demoStudentWorks;
    }

    throw error;
  }

  if (!data?.length) {
    return demoStudentWorks;
  }

  return data.map(mapWorkRow);
}

export async function fetchStudentWorkBySlug(slug: string) {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return temporaryStore.works.find((work) => work.slug === slug && work.status === "published") ?? null;
  }

  if (!supabase) {
    return demoStudentWorks.find((work) => work.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("student_works")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return demoStudentWorks.find((work) => work.slug === slug) ?? null;
    }

    throw error;
  }

  if (!data) {
    return demoStudentWorks.find((work) => work.slug === slug) ?? null;
  }

  return mapWorkRow(data);
}

export async function fetchNotices() {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return sortNotices(temporaryStore.notices.filter((notice) => notice.status === "published"));
  }

  if (!supabase) {
    return demoNotices;
  }

  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("status", "published")
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    if (isMissingSchemaError(error)) {
      return demoNotices;
    }

    throw error;
  }

  if (!data?.length) {
    return demoNotices;
  }

  return data.map(mapNoticeRow);
}

export async function fetchActivePoll(): Promise<PollResult> {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    const activePoll =
      sortPolls(temporaryStore.polls).find((poll) => poll.isActive) ??
      sortPolls(temporaryStore.polls)[0] ??
      demoPoll;

    return { poll: activePoll, source: "temporary" };
  }

  if (!supabase) {
    return { poll: demoPoll, source: "demo" };
  }

  const { data, error } = await supabase
    .from("polls")
    .select("*, poll_options(id, label, votes_count, display_order)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isMissingSchemaError(error)) {
      return { poll: demoPoll, source: "demo" };
    }

    throw error;
  }

  if (!data) {
    return { poll: demoPoll, source: "demo" };
  }

  return { poll: mapPollRow(data), source: "supabase" };
}

export async function voteForPollOption(pollId: string, optionId: string, voterToken: string) {
  const temporaryStore = readTemporaryContentStore();
  if (temporaryStore) {
    return updateTemporaryStore((store) => {
      const poll = store.polls.find((item) => item.id === pollId);
      if (!poll || !poll.isActive || (poll.closesAt && new Date(poll.closesAt).getTime() <= Date.now())) {
        throw new Error("A enquete nao esta ativa.");
      }

      const option = poll.options.find((item) => item.id === optionId);
      if (!option) {
        throw new Error("Opcao nao encontrada.");
      }

      const usedTokens = store.pollVotes[pollId] ?? [];
      if (usedTokens.includes(voterToken)) {
        throw new Error("Voce ja votou nesta enquete.");
      }

      option.votes += 1;
      poll.updatedAt = new Date().toISOString();
      store.pollVotes[pollId] = [...usedTokens, voterToken];

      return {
        success: true,
        poll_id: pollId,
        option_id: optionId,
        total_votes: getTotalVotes(poll),
      };
    });
  }

  const db = requireSupabase();
  const { data, error } = await db.rpc("vote_for_poll_option", {
    p_poll_id: pollId,
    p_option_id: optionId,
    p_voter_token: voterToken,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchAdminNewsArticles() {
  if (shouldUseTemporaryAdminSession()) {
    return sortNewsArticles(ensureTemporaryContentStore().news);
  }

  const db = requireSupabase();
  const { data, error } = await db
    .from("news_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapNewsRow);
}

export async function fetchAdminGalleryItems() {
  if (shouldUseTemporaryAdminSession()) {
    return sortGalleryItems(ensureTemporaryContentStore().gallery);
  }

  const db = requireSupabase();
  const { data, error } = await db
    .from("gallery_items")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapGalleryRow);
}

export async function fetchAdminCalendarEvents() {
  if (shouldUseTemporaryAdminSession()) {
    return sortCalendarEvents(ensureTemporaryContentStore().events);
  }

  const db = requireSupabase();
  const { data, error } = await db
    .from("calendar_events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapEventRow);
}

export async function fetchAdminStudentWorks() {
  if (shouldUseTemporaryAdminSession()) {
    return sortStudentWorks(ensureTemporaryContentStore().works);
  }

  const db = requireSupabase();
  const { data, error } = await db
    .from("student_works")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapWorkRow);
}

export async function fetchAdminNotices() {
  if (shouldUseTemporaryAdminSession()) {
    return sortNotices(ensureTemporaryContentStore().notices);
  }

  const db = requireSupabase();
  const { data, error } = await db
    .from("notices")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapNoticeRow);
}

export async function fetchAdminPolls() {
  if (shouldUseTemporaryAdminSession()) {
    return sortPolls(ensureTemporaryContentStore().polls);
  }

  const db = requireSupabase();
  const { data, error } = await db
    .from("polls")
    .select("*, poll_options(id, label, votes_count, display_order)")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPollRow);
}

export async function saveNewsArticle(input: NewsArticleInput) {
  const validatedInput = validateNewsArticleInput(input);

  if (shouldUseTemporaryAdminSession()) {
    return updateTemporaryStore((store) => {
      const now = new Date().toISOString();
      const existing =
        store.news.find((item) => item.id === validatedInput.id) ??
        store.news.find((item) => item.slug === validatedInput.slug);

      const nextItem: NewsArticle = {
        id: existing?.id ?? validatedInput.id ?? createLocalId("news"),
        slug: validatedInput.slug,
        title: validatedInput.title,
        category: validatedInput.category,
        summary: validatedInput.summary,
        content: validatedInput.content,
        author: validatedInput.author,
        coverImageUrl: validatedInput.coverImageUrl || null,
        coverTone: validatedInput.coverTone,
        featured: validatedInput.featured,
        status: validatedInput.status,
        publishedAt: datetimeLocalToIso(validatedInput.publishedAt),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      store.news = sortNewsArticles([
        nextItem,
        ...store.news.filter((item) => item.id !== nextItem.id),
      ]);

      return nextItem;
    });
  }

  const db = requireSupabase();
  const payload = {
    slug: validatedInput.slug,
    title: validatedInput.title,
    category: validatedInput.category,
    summary: validatedInput.summary,
    content: validatedInput.content,
    author_name: validatedInput.author,
    cover_image_url: validatedInput.coverImageUrl || null,
    cover_tone: validatedInput.coverTone,
    featured: validatedInput.featured,
    status: validatedInput.status,
    published_at: datetimeLocalToIso(validatedInput.publishedAt),
  };

  const query = validatedInput.id
    ? db.from("news_posts").update(payload).eq("id", validatedInput.id)
    : db.from("news_posts").insert(payload);

  const { data, error } = await query.select("*").single();

  if (error) {
    throw error;
  }

  return mapNewsRow(data);
}

export async function deleteNewsArticle(id: string) {
  if (shouldUseTemporaryAdminSession()) {
    updateTemporaryStore((store) => {
      store.news = store.news.filter((item) => item.id !== id);
    });
    return;
  }

  const db = requireSupabase();
  const { error } = await db.from("news_posts").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function saveGalleryItem(input: GalleryItemInput) {
  const validatedInput = validateGalleryItemInput(input);

  if (shouldUseTemporaryAdminSession()) {
    return updateTemporaryStore((store) => {
      const now = new Date().toISOString();
      const existing = store.gallery.find((item) => item.id === validatedInput.id);
      const nextItem: GalleryItem = {
        id: existing?.id ?? validatedInput.id ?? createLocalId("gallery"),
        title: validatedInput.title,
        caption: validatedInput.caption,
        category: validatedInput.category,
        imageUrl: validatedInput.imageUrl || null,
        coverTone: validatedInput.coverTone,
        featured: validatedInput.featured,
        status: validatedInput.status,
        publishedAt: datetimeLocalToIso(validatedInput.publishedAt),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      store.gallery = sortGalleryItems([
        nextItem,
        ...store.gallery.filter((item) => item.id !== nextItem.id),
      ]);

      return nextItem;
    });
  }

  const db = requireSupabase();
  const payload = {
    title: validatedInput.title,
    caption: validatedInput.caption,
    category: validatedInput.category,
    image_url: validatedInput.imageUrl || null,
    cover_tone: validatedInput.coverTone,
    featured: validatedInput.featured,
    status: validatedInput.status,
    published_at: datetimeLocalToIso(validatedInput.publishedAt),
  };

  const query = validatedInput.id
    ? db.from("gallery_items").update(payload).eq("id", validatedInput.id)
    : db.from("gallery_items").insert(payload);

  const { data, error } = await query.select("*").single();

  if (error) {
    throw error;
  }

  return mapGalleryRow(data);
}

export async function deleteGalleryItem(id: string) {
  if (shouldUseTemporaryAdminSession()) {
    updateTemporaryStore((store) => {
      store.gallery = store.gallery.filter((item) => item.id !== id);
    });
    return;
  }

  const db = requireSupabase();
  const { error } = await db.from("gallery_items").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function saveCalendarEvent(input: CalendarEventInput) {
  const validatedInput = validateCalendarEventInput(input);

  if (shouldUseTemporaryAdminSession()) {
    return updateTemporaryStore((store) => {
      const now = new Date().toISOString();
      const existing = store.events.find((item) => item.id === validatedInput.id);
      const nextItem: CalendarEvent = {
        id: existing?.id ?? validatedInput.id ?? createLocalId("event"),
        title: validatedInput.title,
        description: validatedInput.description,
        category: validatedInput.category,
        location: validatedInput.location,
        eventDate: validatedInput.eventDate,
        highlight: validatedInput.highlight,
        status: validatedInput.status,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      store.events = sortCalendarEvents([
        nextItem,
        ...store.events.filter((item) => item.id !== nextItem.id),
      ]);

      return nextItem;
    });
  }

  const db = requireSupabase();
  const payload = {
    title: validatedInput.title,
    description: validatedInput.description,
    category: validatedInput.category,
    location: validatedInput.location,
    event_date: validatedInput.eventDate,
    highlight: validatedInput.highlight,
    status: validatedInput.status,
  };

  const query = validatedInput.id
    ? db.from("calendar_events").update(payload).eq("id", validatedInput.id)
    : db.from("calendar_events").insert(payload);

  const { data, error } = await query.select("*").single();

  if (error) {
    throw error;
  }

  return mapEventRow(data);
}

export async function deleteCalendarEvent(id: string) {
  if (shouldUseTemporaryAdminSession()) {
    updateTemporaryStore((store) => {
      store.events = store.events.filter((item) => item.id !== id);
    });
    return;
  }

  const db = requireSupabase();
  const { error } = await db.from("calendar_events").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function saveStudentWork(input: StudentWorkInput) {
  const validatedInput = validateStudentWorkInput(input);

  if (shouldUseTemporaryAdminSession()) {
    return updateTemporaryStore((store) => {
      const now = new Date().toISOString();
      const existing =
        store.works.find((item) => item.id === validatedInput.id) ??
        store.works.find((item) => item.slug === validatedInput.slug);

      const nextItem: StudentWorkItem = {
        id: existing?.id ?? validatedInput.id ?? createLocalId("work"),
        slug: validatedInput.slug,
        title: validatedInput.title,
        workType: validatedInput.workType,
        author: validatedInput.author,
        excerpt: validatedInput.excerpt,
        content: validatedInput.content,
        coverImageUrl: validatedInput.coverImageUrl || null,
        coverTone: validatedInput.coverTone,
        featured: validatedInput.featured,
        status: validatedInput.status,
        publishedAt: datetimeLocalToIso(validatedInput.publishedAt),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      store.works = sortStudentWorks([
        nextItem,
        ...store.works.filter((item) => item.id !== nextItem.id),
      ]);

      return nextItem;
    });
  }

  const db = requireSupabase();
  const payload = {
    slug: validatedInput.slug,
    title: validatedInput.title,
    work_type: validatedInput.workType,
    author_name: validatedInput.author,
    excerpt: validatedInput.excerpt,
    content: validatedInput.content,
    cover_image_url: validatedInput.coverImageUrl || null,
    cover_tone: validatedInput.coverTone,
    featured: validatedInput.featured,
    status: validatedInput.status,
    published_at: datetimeLocalToIso(validatedInput.publishedAt),
  };

  const query = validatedInput.id
    ? db.from("student_works").update(payload).eq("id", validatedInput.id)
    : db.from("student_works").insert(payload);

  const { data, error } = await query.select("*").single();

  if (error) {
    throw error;
  }

  return mapWorkRow(data);
}

export async function deleteStudentWork(id: string) {
  if (shouldUseTemporaryAdminSession()) {
    updateTemporaryStore((store) => {
      store.works = store.works.filter((item) => item.id !== id);
    });
    return;
  }

  const db = requireSupabase();
  const { error } = await db.from("student_works").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function saveNotice(input: NoticeInput) {
  const validatedInput = validateNoticeInput(input);

  if (shouldUseTemporaryAdminSession()) {
    return updateTemporaryStore((store) => {
      const now = new Date().toISOString();
      const existing = store.notices.find((item) => item.id === validatedInput.id);
      const nextItem: Notice = {
        id: existing?.id ?? validatedInput.id ?? createLocalId("notice"),
        noticeType: validatedInput.noticeType,
        icon: validatedInput.icon,
        title: validatedInput.title,
        description: validatedInput.description,
        pinned: validatedInput.pinned,
        status: validatedInput.status,
        publishedAt: datetimeLocalToIso(validatedInput.publishedAt),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      store.notices = sortNotices([
        nextItem,
        ...store.notices.filter((item) => item.id !== nextItem.id),
      ]);

      return nextItem;
    });
  }

  const db = requireSupabase();
  const payload = {
    notice_type: validatedInput.noticeType,
    icon: validatedInput.icon,
    title: validatedInput.title,
    description: validatedInput.description,
    pinned: validatedInput.pinned,
    status: validatedInput.status,
    published_at: datetimeLocalToIso(validatedInput.publishedAt),
  };

  const query = validatedInput.id
    ? db.from("notices").update(payload).eq("id", validatedInput.id)
    : db.from("notices").insert(payload);

  const { data, error } = await query.select("*").single();

  if (error) {
    throw error;
  }

  return mapNoticeRow(data);
}

export async function deleteNotice(id: string) {
  if (shouldUseTemporaryAdminSession()) {
    updateTemporaryStore((store) => {
      store.notices = store.notices.filter((item) => item.id !== id);
    });
    return;
  }

  const db = requireSupabase();
  const { error } = await db.from("notices").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function savePoll(input: PollInput) {
  const validatedInput = validatePollInput(input);

  if (shouldUseTemporaryAdminSession()) {
    return updateTemporaryStore((store) => {
      const now = new Date().toISOString();
      const existing = store.polls.find((item) => item.id === validatedInput.id);
      const pollId = existing?.id ?? validatedInput.id ?? createLocalId("poll");
      const existingOptions = new Map(existing?.options.map((option) => [option.id, option]) ?? []);
      const nextOptions = validatedInput.options
        .filter((option) => option.label.trim())
        .map((option, index) => {
          const existingOption = option.id ? existingOptions.get(option.id) : undefined;

          return {
            id: existingOption?.id ?? option.id ?? createLocalId("poll-option"),
            label: option.label.trim(),
            votes: option.votes,
            displayOrder: index,
          };
        });

      const nextPoll: Poll = {
        id: pollId,
        question: validatedInput.question,
        description: validatedInput.description,
        isActive: validatedInput.isActive,
        closesAt: validatedInput.closesAt ? datetimeLocalToIso(validatedInput.closesAt) : null,
        options: nextOptions,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };

      const otherPolls = store.polls
        .filter((item) => item.id !== pollId)
        .map((item) => (validatedInput.isActive ? { ...item, isActive: false } : item));

      store.polls = sortPolls([nextPoll, ...otherPolls]);
      store.pollVotes[pollId] = store.pollVotes[pollId] ?? [];

      return nextPoll;
    });
  }

  const db = requireSupabase();

  if (validatedInput.isActive && validatedInput.id) {
    const { error } = await db.from("polls").update({ is_active: false }).neq("id", validatedInput.id);
    if (error) {
      throw error;
    }
  }

  if (validatedInput.isActive && !validatedInput.id) {
    const { error } = await db.from("polls").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      throw error;
    }
  }

  const pollPayload = {
    question: validatedInput.question,
    description: validatedInput.description,
    is_active: validatedInput.isActive,
    closes_at: validatedInput.closesAt ? datetimeLocalToIso(validatedInput.closesAt) : null,
  };

  const pollQuery = validatedInput.id
    ? db.from("polls").update(pollPayload).eq("id", validatedInput.id)
    : db.from("polls").insert(pollPayload);

  const { data: pollData, error: pollError } = await pollQuery.select("*").single();

  if (pollError) {
    throw pollError;
  }

  const pollId = pollData.id as string;

  const { data: existingOptions, error: existingOptionsError } = await db
    .from("poll_options")
    .select("id")
    .eq("poll_id", pollId);

  if (existingOptionsError) {
    throw existingOptionsError;
  }

  const keepIds: string[] = [];

  for (const [index, option] of validatedInput.options.entries()) {
    const label = option.label.trim();
    if (!label) {
      continue;
    }

    const optionPayload = {
      poll_id: pollId,
      label,
      votes_count: option.votes,
      display_order: index,
    };

    const optionQuery = option.id
      ? db.from("poll_options").update(optionPayload).eq("id", option.id)
      : db.from("poll_options").insert(optionPayload);

    const { data: optionData, error: optionError } = await optionQuery.select("*").single();

    if (optionError) {
      throw optionError;
    }

    keepIds.push(optionData.id as string);
  }

  const idsToDelete = (existingOptions ?? [])
    .map((option) => option.id as string)
    .filter((id) => !keepIds.includes(id));

  if (idsToDelete.length > 0) {
    const { error } = await db.from("poll_options").delete().in("id", idsToDelete);
    if (error) {
      throw error;
    }
  }

  const { data: finalPoll, error: finalError } = await db
    .from("polls")
    .select("*, poll_options(id, label, votes_count, display_order)")
    .eq("id", pollId)
    .single();

  if (finalError) {
    throw finalError;
  }

  return mapPollRow(finalPoll);
}

export async function deletePoll(id: string) {
  if (shouldUseTemporaryAdminSession()) {
    updateTemporaryStore((store) => {
      store.polls = store.polls.filter((item) => item.id !== id);
      delete store.pollVotes[id];
    });
    return;
  }

  const db = requireSupabase();
  const { error } = await db.from("polls").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function seedDatabaseWithDemoContent() {
  if (shouldUseTemporaryAdminSession()) {
    writeTemporaryContentStore(createDefaultTemporaryContentStore());
    return;
  }

  await Promise.all([
    Promise.all(
      demoNewsArticles.map((article) =>
        saveNewsArticle({
          id: article.id.startsWith("news-") ? undefined : article.id,
          slug: article.slug,
          title: article.title,
          category: article.category,
          summary: article.summary,
          content: article.content,
          author: article.author,
          coverImageUrl: article.coverImageUrl ?? "",
          coverTone: article.coverTone,
          featured: article.featured,
          status: article.status,
          publishedAt: article.publishedAt,
        }),
      ),
    ),
    Promise.all(
      demoGalleryItems.map((item) =>
        saveGalleryItem({
          title: item.title,
          caption: item.caption,
          category: item.category,
          imageUrl: item.imageUrl ?? "",
          coverTone: item.coverTone,
          featured: item.featured,
          status: item.status,
          publishedAt: item.publishedAt,
        }),
      ),
    ),
    Promise.all(
      demoCalendarEvents.map((event) =>
        saveCalendarEvent({
          title: event.title,
          description: event.description,
          category: event.category,
          location: event.location,
          eventDate: event.eventDate,
          highlight: event.highlight,
          status: event.status,
        }),
      ),
    ),
    Promise.all(
      demoStudentWorks.map((work) =>
        saveStudentWork({
          slug: work.slug,
          title: work.title,
          workType: work.workType,
          author: work.author,
          excerpt: work.excerpt,
          content: work.content,
          coverImageUrl: work.coverImageUrl ?? "",
          coverTone: work.coverTone,
          featured: work.featured,
          status: work.status,
          publishedAt: work.publishedAt,
        }),
      ),
    ),
    Promise.all(
      demoNotices.map((notice) =>
        saveNotice({
          noticeType: notice.noticeType,
          icon: notice.icon,
          title: notice.title,
          description: notice.description,
          pinned: notice.pinned,
          status: notice.status,
          publishedAt: notice.publishedAt,
        }),
      ),
    ),
    savePoll({
      question: demoPoll.question,
      description: demoPoll.description,
      isActive: true,
      closesAt: "",
      options: demoPoll.options.map((option) => ({
        label: option.label,
        votes: option.votes,
      })),
    }),
  ]);
}

export function getDemoNewsArticle(slug: string) {
  return demoNewsArticles.find((article) => article.slug === slug) ?? null;
}

export function getDemoStudentWork(slug: string) {
  return demoStudentWorks.find((work) => work.slug === slug) ?? null;
}

export function getTotalVotes(poll: Poll) {
  return poll.options.reduce((total, option) => total + option.votes, 0);
}

export function formatPublishedLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTimeLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateInputValue(value: string) {
  return value.slice(0, 10);
}

export function formatDateTimeInputValue(value: string) {
  return new Date(isoOrNow(value)).toISOString().slice(0, 16);
}
