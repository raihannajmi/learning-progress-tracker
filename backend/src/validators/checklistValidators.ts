import { z } from 'zod';

export const updateChecklistProgressSchema = z.object({
  body: z.object({
    checklistItemId: z.string().uuid('Checklist item ID tidak valid'),
    status: z.enum(
      ['NOT_STARTED', 'LEARNING', 'PRACTICING', 'CAN_DO_INDEPENDENTLY'],
      {
        required_error: 'Status self-assessment wajib dipilih',
      }
    ),
  }),
});
