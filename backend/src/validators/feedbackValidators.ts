import { z } from 'zod';

export const createFeedbackSchema = z.object({
  params: z.object({
    id: z.string().uuid('Sprint ID tidak valid'),
  }),
  body: z.object({
    comment: z
      .string({ required_error: 'Feedback komentar wajib diisi' })
      .min(3, 'Feedback minimal 3 karakter')
      .max(1000, 'Feedback maksimal 1000 karakter'),
  }),
});

export const updateFeedbackSchema = z.object({
  params: z.object({
    id: z.string().uuid('Sprint ID tidak valid'),
    feedbackId: z.string().uuid('Feedback ID tidak valid'),
  }),
  body: z.object({
    comment: z
      .string({ required_error: 'Feedback komentar wajib diisi' })
      .min(3, 'Feedback minimal 3 karakter')
      .max(1000, 'Feedback maksimal 1000 karakter'),
  }),
});

export const deleteFeedbackSchema = z.object({
  params: z.object({
    id: z.string().uuid('Sprint ID tidak valid'),
    feedbackId: z.string().uuid('Feedback ID tidak valid'),
  }),
});

