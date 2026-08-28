import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { sendSuccess } from '../utils/response.js';

export class DashboardController {
  static async getStudentDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isCallerAdmin = req.user!.role === 'ADMIN';
      const requestedUserId = req.query.userId as string | undefined;

      // Admins can inspect any student's dashboard; students are strictly locked to their own ID
      const targetUserId = isCallerAdmin && requestedUserId ? requestedUserId : req.user!.id;

      const data = await DashboardService.getStudentDashboard(targetUserId);
      sendSuccess(res, data, 'Dashboard Mahasiswa');
    } catch (error) {
      next(error);
    }
  }

  static async getAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.query as { classId?: string };
      const data = await DashboardService.getAdminDashboard(classId);
      sendSuccess(res, data, 'Dashboard Asisten Dosen & Dosen');
    } catch (error) {
      next(error);
    }
  }
}
