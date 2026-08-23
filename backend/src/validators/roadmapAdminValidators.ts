import { z } from 'zod';

export const createWeekSchema = z.object({
  body: z.object({
    weekNumber: z.number({ required_error: 'Nomor minggu wajib diisi' }).min(1),
    title: z.string({ required_error: 'Judul minggu silabus wajib diisi' }).min(3),
    description: z.string().optional().nullable(),
    isCurrent: z.boolean().optional().default(false),
  }),
});

export const reorderWeeksSchema = z.object({
  body: z.object({
    weekOrders: z
      .array(
        z.object({
          id: z.string({ required_error: 'ID minggu wajib diisi' }),
          weekNumber: z.number().min(1),
        })
      )
      .min(1, 'Daftar minggu harus berisi minimal 1 item'),
  }),
});

export const updateWeekSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'ID minggu wajib disertakan' }),
  }),
  body: z.object({
    weekNumber: z.number().min(1).optional(),
    title: z.string().min(3).optional(),
    description: z.string().optional().nullable(),
    isCurrent: z.boolean().optional(),
  }),
});

export const createTopicSchema = z.object({
  body: z.object({
    weekId: z.string({ required_error: 'Week ID wajib diisi' }),
    title: z.string({ required_error: 'Judul topik wajib diisi' }).min(3),
    category: z.enum(['HTML', 'CSS', 'JAVASCRIPT', 'BACKEND', 'FULLSTACK']),
    sortOrder: z.number().optional().default(1),
  }),
});

export const updateTopicSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'ID topik wajib disertakan' }),
  }),
  body: z.object({
    weekId: z.string().optional(),
    title: z.string().min(3).optional(),
    category: z.enum(['HTML', 'CSS', 'JAVASCRIPT', 'BACKEND', 'FULLSTACK']).optional(),
    sortOrder: z.number().optional(),
  }),
});

export const createChecklistSchema = z.object({
  body: z.object({
    topicId: z.string({ required_error: 'Topic ID wajib diisi' }),
    statement: z.string({ required_error: 'Pernyataan checklist wajib diisi' }).min(5),
    sortOrder: z.number().optional().default(1),
  }),
});

export const updateChecklistSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'ID checklist wajib disertakan' }),
  }),
  body: z.object({
    topicId: z.string().optional(),
    statement: z.string().min(5).optional(),
    sortOrder: z.number().optional(),
  }),
});
