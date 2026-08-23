import { Request, Response, NextFunction } from 'express';
import { SprintService } from '../services/sprintService.js';
import { sendSuccess } from '../utils/response.js';

export class SprintController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, userId, needsFeedback, page, limit } = req.query as {
        classId?: string;
        userId?: string;
        needsFeedback?: string;
        page?: string;
        limit?: string;
      };

      const result = await SprintService.listSprints({
        classId,
        userId,
        needsFeedback: needsFeedback === 'true' ? true : undefined,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      sendSuccess(res, result.data, 'Daftar learning sprint', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, status, search, page, limit } = req.query as {
        classId?: string;
        status?: 'ALL' | 'PENDING' | 'REVIEWED';
        search?: string;
        page?: string;
        limit?: string;
      };

      const result = await SprintService.listReviewQueue({
        classId,
        status,
        search,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });

      sendSuccess(res, result.data, 'Daftar antrean review asistensi', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sprintId = req.params.sprintId as string;
      const instructorId = req.user!.id;
      const { instructorFeedback, reviewStatus } = req.body;

      const data = await SprintService.submitInstructorReview(sprintId, instructorId, {
        instructorFeedback,
        reviewStatus,
      });

      sendSuccess(res, data, 'Feedback dosen berhasil disimpan!');
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

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const data = await SprintService.updateSprint(id, userId, userRole, req.body);
      sendSuccess(res, data, 'Learning sprint berhasil diperbarui!');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const data = await SprintService.deleteSprint(id, userId, userRole);
      sendSuccess(res, data, 'Learning sprint berhasil dihapus!');
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

  static async updateFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sprintId = req.params.id as string;
      const feedbackId = req.params.feedbackId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { comment } = req.body;
      const data = await SprintService.updateFeedback(sprintId, feedbackId, userId, userRole, comment);
      sendSuccess(res, data, 'Feedback berhasil diperbarui!');
    } catch (error) {
      next(error);
    }
  }

  static async deleteFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sprintId = req.params.id as string;
      const feedbackId = req.params.feedbackId as string;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const data = await SprintService.deleteFeedback(sprintId, feedbackId, userId, userRole);
      sendSuccess(res, data, 'Feedback berhasil dihapus!');
    } catch (error) {
      next(error);
    }
  }
}

