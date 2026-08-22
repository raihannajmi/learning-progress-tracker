import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Format email tidak valid'),
    nim: z.string().min(3, 'NIM minimal 3 karakter'),
    classId: z.string().uuid('Class ID tidak valid'),
    githubRepoUrl: z.string().url('URL repository tidak valid').optional().or(z.literal('')),
    githubPageUrl: z.string().url('URL GitHub page tidak valid').optional().or(z.literal('')),
  }),
});

export const batchCreateStudentSchema = z.object({
  body: z.object({
    classId: z.string().uuid('Class ID tidak valid'),
    students: z
      .array(
        z.object({
          name: z.string().min(2, 'Nama minimal 2 karakter'),
          email: z.string().email('Format email tidak valid'),
          nim: z.string().min(3, 'NIM minimal 3 karakter'),
          githubRepoUrl: z.string().optional().or(z.literal('')),
          githubPageUrl: z.string().optional().or(z.literal('')),
        })
      )
      .min(1, 'Minimal 1 data mahasiswa diperlukan'),
  }),
});

export const updateStudentSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID mahasiswa tidak valid'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    nim: z.string().min(3).optional(),
    classId: z.string().uuid().optional(),
    githubRepoUrl: z.string().optional().or(z.literal('')),
    githubPageUrl: z.string().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  }),
});
