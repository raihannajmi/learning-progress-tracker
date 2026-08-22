import { Request, Response, NextFunction } from 'express';
import { SprintService } from '../services/sprintService.js';
import { sendSuccess } from '../utils/response.js';

export class SprintController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, userId, page, limit } = req.query as {
        classId?: string;
        userId?: string;
        page?: string;
        limit?: string;
      };

      const data = await SprintService.listSprints({
        classId,
        userId,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      });

      sendSuccess(res, data, 'Daftar learning sprint');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await SprintService.getSprintById(id);
      sendSuccess(res, data, 'Detail learning sprint');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await SprintService.createSprint(userId, req.body);
      sendSuccess(res, data, 'Learning sprint berhasil dicatat!', 201);
    } catch (error) {
      next(error);
    }
  }

  static async addFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const authorId = req.user!.id;
      const { comment } = req.body;
      const data = await SprintService.addFeedback(id, authorId, comment);
      sendSuccess(res, data, 'Feedback berhasil dikirimkan!', 201);
    } catch (error) {
      next(error);
    }
  }
}
