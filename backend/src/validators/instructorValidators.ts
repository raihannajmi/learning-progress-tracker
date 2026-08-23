import { z } from 'zod';

export const createInstructorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Nama lengkap dosen/pengajar wajib diisi' })
      .min(2, 'Nama minimal 2 karakter')
      .max(255, 'Nama maksimal 255 karakter'),
    email: z
      .string({ required_error: 'Email Google OAuth wajib diisi' })
      .email('Format email tidak valid')
      .max(255, 'Email maksimal 255 karakter'),
  }),
});

export const updateInstructorSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID pengajar tidak valid'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Nama minimal 2 karakter')
      .max(255, 'Nama maksimal 255 karakter')
      .optional(),
    email: z
      .string()
      .email('Format email tidak valid')
      .max(255, 'Email maksimal 255 karakter')
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteInstructorSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID pengajar tidak valid'),
  }),
});
