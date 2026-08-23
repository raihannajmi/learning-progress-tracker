import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed: any = await schema.passthrough().parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined && req.query && typeof req.query === 'object') {
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params !== undefined && req.params && typeof req.params === 'object') {
        Object.assign(req.params, parsed.params);
      }

      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          field: e.path.join('.').replace(/^(body|query|params)\./, ''),
          message: e.message,
        }));
        const primaryMessage = issues[0]?.message || 'Validasi input gagal';
        sendError(res, primaryMessage, 422, 'VALIDATION_ERROR', issues);
        return;
      }
      sendError(res, error?.message || 'Terjadi kesalahan validasi input', 400);
    }
  };
};
