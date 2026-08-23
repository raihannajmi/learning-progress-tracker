import { Request, Response, NextFunction } from 'express';
import { RoadmapAdminService } from '../services/roadmapAdminService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RoadmapAdminController {
  // === WEEKS ===
  static async createWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await RoadmapAdminService.createWeek(req.body);
      sendSuccess(res, created, 'Minggu silabus berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await RoadmapAdminService.updateWeek(req.params.id as string, req.body);
      sendSuccess(res, updated, 'Minggu silabus berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  static async setCurrentWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await RoadmapAdminService.setCurrentWeek(req.params.id as string);
      sendSuccess(res, updated, 'Minggu aktif silabus berhasil diubah');
    } catch (error) {
      next(error);
    }
  }

  static async deleteWeek(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await RoadmapAdminService.deleteWeek(req.params.id as string);
      sendSuccess(res, deleted, 'Minggu silabus berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  // === TOPICS ===
  static async createTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await RoadmapAdminService.createTopic(req.body);
      sendSuccess(res, created, 'Topik berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await RoadmapAdminService.updateTopic(req.params.id as string, req.body);
      sendSuccess(res, updated, 'Topik berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTopic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await RoadmapAdminService.deleteTopic(req.params.id as string);
      sendSuccess(res, deleted, 'Topik berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  // === CHECKLISTS ===
  static async createChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await RoadmapAdminService.createChecklist(req.body);
      sendSuccess(res, created, 'Checklist item berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await RoadmapAdminService.updateChecklist(req.params.id as string, req.body);
      sendSuccess(res, updated, 'Checklist item berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  static async deleteChecklist(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await RoadmapAdminService.deleteChecklist(req.params.id as string);
      sendSuccess(res, deleted, 'Checklist item berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }
}
