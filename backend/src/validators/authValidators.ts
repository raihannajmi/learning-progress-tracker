import { z } from 'zod';

export const googleVerifySchema = z.object({
  body: z
    .object({
      credential: z.string().optional(),
      code: z.string().optional(),
      token: z.string().optional(),
      id_token: z.string().optional(),
    })
    .passthrough()
    .optional(),
  query: z
    .object({
      code: z.string().optional(),
      credential: z.string().optional(),
    })
    .passthrough()
    .optional(),
});
