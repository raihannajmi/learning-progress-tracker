import { z } from 'zod';

export const createSprintSchema = z.object({
  body: z.object({
    topicId: z.string().optional().nullable(),
    durationMinutes: z
      .number({ required_error: 'Durasi belajar wajib diisi' })
      .min(1, 'Durasi belajar minimal 1 menit'),
    whatLearned: z
      .string({ required_error: 'Catatan apa yang dipelajari wajib diisi' })
      .min(5, 'Penjelasan apa yang dipelajari minimal 5 karakter'),
    whatPracticed: z
      .string({ required_error: 'Catatan apa yang dipraktekkan wajib diisi' })
      .min(5, 'Penjelasan apa yang dipraktekkan minimal 5 karakter'),
    confusingParts: z.string().optional().nullable(),
    evidenceUrl: z.string().optional().or(z.literal('')).nullable(),
    evidenceType: z
      .enum(['GITHUB', 'GITHUB_PAGES', 'LOOM', 'FIGMA', 'LIVE_DEMO', 'OTHER'])
      .default('OTHER'),
  }),
});

export const querySprintSchema = z.object({
  query: z
    .object({
      classId: z.string().optional().nullable(),
      userId: z.string().optional().nullable(),
      page: z.string().optional(),
      limit: z.string().optional(),
    })
    .optional(),
});
