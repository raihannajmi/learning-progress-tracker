import { z } from 'zod';

const minWords = (count: number, msg: string) =>
  z.string({ required_error: msg }).refine(
    (val) => val.trim().split(/\s+/).filter(Boolean).length >= count,
    { message: msg }
  );

export const createSprintSchema = z.object({
  body: z.object({
    topicId: z.string().optional().nullable(),
    durationMinutes: z
      .number({ required_error: 'Durasi belajar wajib diisi' })
      .min(1, 'Durasi belajar minimal 1 menit'),
    whatLearned: minWords(15, 'Ceritakan pemahaman konsep Anda minimal 15 kata'),
    whatPracticed: minWords(15, 'Ceritakan hasil praktek atau eksperimen kode Anda minimal 15 kata'),
    confusingParts: z.string().optional().nullable(),
    evidenceUrl: z.string().optional().or(z.literal('')).nullable(),
    loomUrl: z.string().optional().or(z.literal('')).nullable(),
    demoUrl: z.string().optional().or(z.literal('')).nullable(),
    evidenceType: z
      .enum(['GITHUB', 'GITHUB_PAGES', 'LOOM', 'FIGMA', 'LIVE_DEMO', 'OTHER'])
      .default('OTHER'),
    needsFeedback: z.boolean().optional(),
  }),
});

export const querySprintSchema = z.object({
  query: z
    .object({
      classId: z.string().optional().nullable(),
      userId: z.string().optional().nullable(),
      needsFeedback: z.string().optional().nullable(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
});

export const updateSprintSchema = z.object({
  params: z.object({
    id: z.string().uuid('Sprint ID tidak valid'),
  }),
  body: z.object({
    topicId: z.string().optional().nullable(),
    durationMinutes: z.number().min(1, 'Durasi belajar minimal 1 menit').optional(),
    whatLearned: z
      .string()
      .refine((val) => val.trim().split(/\s+/).filter(Boolean).length >= 15, {
        message: 'Ceritakan pemahaman konsep Anda minimal 15 kata',
      })
      .optional(),
    whatPracticed: z
      .string()
      .refine((val) => val.trim().split(/\s+/).filter(Boolean).length >= 15, {
        message: 'Ceritakan hasil praktek atau eksperimen kode Anda minimal 15 kata',
      })
      .optional(),
    confusingParts: z.string().optional().nullable(),
    evidenceUrl: z.string().optional().or(z.literal('')).nullable(),
    loomUrl: z.string().optional().or(z.literal('')).nullable(),
    demoUrl: z.string().optional().or(z.literal('')).nullable(),
    evidenceType: z
      .enum(['GITHUB', 'GITHUB_PAGES', 'LOOM', 'FIGMA', 'LIVE_DEMO', 'OTHER'])
      .optional(),
    needsFeedback: z.boolean().optional(),
  }),
});

export const deleteSprintSchema = z.object({
  params: z.object({
    id: z.string().uuid('Sprint ID tidak valid'),
  }),
});

