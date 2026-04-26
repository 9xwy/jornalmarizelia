import {
  demoCalendarEvents,
  demoGalleryItems,
  demoNewsArticles,
  demoNotices,
  demoPoll,
  demoStudentWorks,
} from "@/data/content";
import type {
  CalendarEvent,
  GalleryItem,
  NewsArticle,
  Notice,
  Poll,
  StudentWorkItem,
} from "@/types/content";

export const tempAdminEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_TEMP_ADMIN_LOGIN === "true";
export const tempAdminUsername = import.meta.env.VITE_TEMP_ADMIN_USERNAME?.trim() || "admin1";
export const tempAdminPassword = import.meta.env.VITE_TEMP_ADMIN_PASSWORD?.trim() || "admin1";
export const tempAdminSessionKey = "jm-temp-admin-session";

const tempAdminContentKey = "jm-temp-admin-content-v1";

export type TemporaryContentStore = {
  news: NewsArticle[];
  gallery: GalleryItem[];
  events: CalendarEvent[];
  works: StudentWorkItem[];
  notices: Notice[];
  polls: Poll[];
  pollVotes: Record<string, string[]>;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function createDefaultTemporaryContentStore(): TemporaryContentStore {
  return {
    news: cloneValue(demoNewsArticles),
    gallery: cloneValue(demoGalleryItems),
    events: cloneValue(demoCalendarEvents),
    works: cloneValue(demoStudentWorks),
    notices: cloneValue(demoNotices),
    polls: [cloneValue(demoPoll)],
    pollVotes: {},
  };
}

function normalizeStore(store: Partial<TemporaryContentStore> | null | undefined): TemporaryContentStore {
  const defaults = createDefaultTemporaryContentStore();

  return {
    news: Array.isArray(store?.news) ? store.news : defaults.news,
    gallery: Array.isArray(store?.gallery) ? store.gallery : defaults.gallery,
    events: Array.isArray(store?.events) ? store.events : defaults.events,
    works: Array.isArray(store?.works) ? store.works : defaults.works,
    notices: Array.isArray(store?.notices) ? store.notices : defaults.notices,
    polls: Array.isArray(store?.polls) ? store.polls : defaults.polls,
    pollVotes:
      store?.pollVotes && typeof store.pollVotes === "object" && !Array.isArray(store.pollVotes)
        ? store.pollVotes
        : defaults.pollVotes,
  };
}

export function hasTemporaryAdminSession() {
  if (!tempAdminEnabled || !isBrowser()) {
    return false;
  }

  return window.localStorage.getItem(tempAdminSessionKey) === "active";
}

export function setTemporaryAdminSession(active: boolean) {
  if (!tempAdminEnabled || !isBrowser()) {
    return;
  }

  if (active) {
    window.localStorage.setItem(tempAdminSessionKey, "active");
    return;
  }

  window.localStorage.removeItem(tempAdminSessionKey);
}

export function readTemporaryContentStore() {
  if (!tempAdminEnabled || !isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(tempAdminContentKey);
  if (!raw) {
    return null;
  }

  try {
    return normalizeStore(JSON.parse(raw) as Partial<TemporaryContentStore>);
  } catch {
    window.localStorage.removeItem(tempAdminContentKey);
    return null;
  }
}

export function writeTemporaryContentStore(store: TemporaryContentStore) {
  if (!tempAdminEnabled || !isBrowser()) {
    return;
  }

  window.localStorage.setItem(tempAdminContentKey, JSON.stringify(store));
}

export function ensureTemporaryContentStore() {
  const existing = readTemporaryContentStore();
  if (existing) {
    return existing;
  }

  const initial = createDefaultTemporaryContentStore();
  writeTemporaryContentStore(initial);
  return initial;
}
