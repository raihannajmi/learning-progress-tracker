import { Request, Response, NextFunction } from 'express';
import { ChecklistService } from '../services/checklistService.js';
import { sendSuccess } from '../utils/response.js';

export class ChecklistController {
  static async getMyProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await ChecklistService.getMyProgress(userId);
      sendSuccess(res, data, 'Data progres checklist Anda');
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { checklistItemId, status } = req.body;
      const data = await ChecklistService.updateProgress(userId, checklistItemId, status);
      sendSuccess(res, data, 'Status self-assessment berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }
}
