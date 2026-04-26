import { z } from "zod";
import { noticeIcons, noticeTypes, newsCategories, toneOptions, workTypes } from "@/lib/site-config";
import { coerceAllowedValue, sanitizeExternalUrl, sanitizeMultilineText, sanitizeSingleLineText } from "@/lib/security";
import type {
  CalendarEventInput,
  GalleryItemInput,
  NewsArticleInput,
  NoticeInput,
  PollInput,
  StudentWorkInput,
} from "@/types/content";

const contentStatusSchema = z.enum(["draft", "published"]);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalido.");
const datetimeSchema = z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), "Data invalida.");
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data invalida.");

function requireSafeImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const safeUrl = sanitizeExternalUrl(trimmed);
  if (!safeUrl) {
    throw new Error("Use apenas URLs de imagem http/https validas.");
  }

  return safeUrl;
}

function normalizeOptionalDateTime(value: string) {
  if (!value.trim()) {
    return "";
  }

  return new Date(value).toISOString();
}

const newsArticleSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  title: z.string().min(3).max(160),
  category: z.string().refine((value) => newsCategories.includes(value), "Categoria invalida."),
  summary: z.string().min(10).max(320),
  content: z.string().min(20).max(20000),
  author: z.string().min(2).max(80),
  coverImageUrl: z.string().max(2048),
  coverTone: z.string().refine((value) => toneOptions.includes(value), "Tema de capa invalido."),
  featured: z.boolean(),
  status: contentStatusSchema,
  publishedAt: datetimeSchema,
});

const galleryItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(160),
  caption: z.string().max(500),
  category: z.string().min(2).max(60),
  imageUrl: z.string().max(2048),
  coverTone: z.string().refine((value) => toneOptions.includes(value), "Tema de capa invalido."),
  featured: z.boolean(),
  status: contentStatusSchema,
  publishedAt: datetimeSchema,
});

const calendarEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3).max(160),
  description: z.string().max(1200),
  category: z.string().min(2).max(60),
  location: z.string().max(160),
  eventDate: dateSchema,
  highlight: z.boolean(),
  status: contentStatusSchema,
});

const studentWorkSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  title: z.string().min(3).max(160),
  workType: z.string().refine((value) => workTypes.includes(value), "Tipo de trabalho invalido."),
  author: z.string().min(2).max(80),
  excerpt: z.string().min(10).max(400),
  content: z.string().min(20).max(25000),
  coverImageUrl: z.string().max(2048),
  coverTone: z.string().refine((value) => toneOptions.includes(value), "Tema de capa invalido."),
  featured: z.boolean(),
  status: contentStatusSchema,
  publishedAt: datetimeSchema,
});

const noticeSchema = z.object({
  id: z.string().optional(),
  noticeType: z.string().refine((value) => noticeTypes.includes(value), "Tipo de aviso invalido."),
  icon: z.string().refine((value) => noticeIcons.includes(value), "Icone invalido."),
  title: z.string().min(3).max(160),
  description: z.string().min(10).max(800),
  pinned: z.boolean(),
  status: contentStatusSchema,
  publishedAt: datetimeSchema,
});

const pollSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(8).max(200),
  description: z.string().max(500),
  isActive: z.boolean(),
  closesAt: z.string(),
  options: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1).max(120),
        votes: z.number().int().min(0).max(1000000),
      }),
    )
    .min(2),
});

export function normalizeTone(value: string | null | undefined) {
  return coerceAllowedValue(value, toneOptions, toneOptions[0]);
}

export function validateNewsArticleInput(input: NewsArticleInput): NewsArticleInput {
  return newsArticleSchema.parse({
    ...input,
    title: sanitizeSingleLineText(input.title, 160),
    category: sanitizeSingleLineText(input.category, 40),
    summary: sanitizeMultilineText(input.summary, 320),
    content: sanitizeMultilineText(input.content, 20000),
    author: sanitizeSingleLineText(input.author, 80),
    coverImageUrl: requireSafeImageUrl(input.coverImageUrl),
    coverTone: coerceAllowedValue(input.coverTone, toneOptions, ""),
    publishedAt: new Date(input.publishedAt).toISOString(),
  });
}

export function validateGalleryItemInput(input: GalleryItemInput): GalleryItemInput {
  return galleryItemSchema.parse({
    ...input,
    title: sanitizeSingleLineText(input.title, 160),
    caption: sanitizeMultilineText(input.caption, 500),
    category: sanitizeSingleLineText(input.category, 60),
    imageUrl: requireSafeImageUrl(input.imageUrl),
    coverTone: coerceAllowedValue(input.coverTone, toneOptions, ""),
    publishedAt: new Date(input.publishedAt).toISOString(),
  });
}

export function validateCalendarEventInput(input: CalendarEventInput): CalendarEventInput {
  return calendarEventSchema.parse({
    ...input,
    title: sanitizeSingleLineText(input.title, 160),
    description: sanitizeMultilineText(input.description, 1200),
    category: sanitizeSingleLineText(input.category, 60),
    location: sanitizeSingleLineText(input.location, 160),
    eventDate: input.eventDate,
  });
}

export function validateStudentWorkInput(input: StudentWorkInput): StudentWorkInput {
  return studentWorkSchema.parse({
    ...input,
    title: sanitizeSingleLineText(input.title, 160),
    workType: sanitizeSingleLineText(input.workType, 40),
    author: sanitizeSingleLineText(input.author, 80),
    excerpt: sanitizeMultilineText(input.excerpt, 400),
    content: sanitizeMultilineText(input.content, 25000),
    coverImageUrl: requireSafeImageUrl(input.coverImageUrl),
    coverTone: coerceAllowedValue(input.coverTone, toneOptions, ""),
    publishedAt: new Date(input.publishedAt).toISOString(),
  });
}

export function validateNoticeInput(input: NoticeInput): NoticeInput {
  return noticeSchema.parse({
    ...input,
    noticeType: sanitizeSingleLineText(input.noticeType, 40),
    icon: sanitizeSingleLineText(input.icon, 40),
    title: sanitizeSingleLineText(input.title, 160),
    description: sanitizeMultilineText(input.description, 800),
    publishedAt: new Date(input.publishedAt).toISOString(),
  });
}

export function validatePollInput(input: PollInput): PollInput {
  const closesAt = normalizeOptionalDateTime(input.closesAt);
  const options = input.options
    .map((option) => ({
      ...option,
      label: sanitizeSingleLineText(option.label, 120),
      votes: Math.max(0, Math.trunc(option.votes)),
    }))
    .filter((option) => option.label);

  return pollSchema.parse({
    ...input,
    question: sanitizeSingleLineText(input.question, 200),
    description: sanitizeMultilineText(input.description, 500),
    closesAt,
    options,
  });
}
