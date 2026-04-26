import { useQuery } from "@tanstack/react-query";
import {
  fetchActivePoll,
  fetchCalendarEvents,
  fetchGalleryItems,
  fetchNewsArticleBySlug,
  fetchNewsArticles,
  fetchNotices,
  fetchStudentWorkBySlug,
  fetchStudentWorks,
  fetchSupabaseSetupStatus,
  queryKeys,
} from "@/lib/content-api";

export function useNewsArticles() {
  return useQuery({
    queryKey: queryKeys.news,
    queryFn: fetchNewsArticles,
  });
}

export function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: queryKeys.newsBySlug(slug),
    queryFn: () => fetchNewsArticleBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useGalleryItems() {
  return useQuery({
    queryKey: queryKeys.gallery,
    queryFn: fetchGalleryItems,
  });
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: queryKeys.events,
    queryFn: fetchCalendarEvents,
  });
}

export function useStudentWorks() {
  return useQuery({
    queryKey: queryKeys.works,
    queryFn: fetchStudentWorks,
  });
}

export function useStudentWork(slug: string) {
  return useQuery({
    queryKey: queryKeys.workBySlug(slug),
    queryFn: () => fetchStudentWorkBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useNotices() {
  return useQuery({
    queryKey: queryKeys.notices,
    queryFn: fetchNotices,
  });
}

export function useActivePoll() {
  return useQuery({
    queryKey: queryKeys.poll,
    queryFn: fetchActivePoll,
  });
}

export function useSupabaseSetupStatus() {
  return useQuery({
    queryKey: queryKeys.setup,
    queryFn: fetchSupabaseSetupStatus,
  });
}
