import { z } from 'zod';

export const googleVerifySchema = z.object({
  body: z.object({
    credential: z.string({
      required_error: 'Google credential token wajib disertakan',
    }),
  }),
});
