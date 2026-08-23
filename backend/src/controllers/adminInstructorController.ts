import { Request, Response, NextFunction } from 'express';
import { AdminInstructorService } from '../services/adminInstructorService.js';
import { sendSuccess } from '../utils/response.js';

export class AdminInstructorController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const result = await AdminInstructorService.listInstructors({ search });
      sendSuccess(res, result.data, 'Daftar dosen dan tim pengajar', 200, {
        page: 1,
        limit: result.total,
        total: result.total,
        totalPages: 1,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email } = req.body;
      const result = await AdminInstructorService.addInstructor({ name, email });
      sendSuccess(res, result, 'Dosen/Pengajar baru berhasil ditambahkan.', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, email, isActive } = req.body;
      const currentAdminId = req.user!.id;

      const result = await AdminInstructorService.updateInstructor(
        id,
        { name, email, isActive },
        currentAdminId
      );

      sendSuccess(res, result, 'Data Dosen/Pengajar berhasil diperbarui.');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const currentAdminId = req.user!.id;

      const result = await AdminInstructorService.deleteInstructor(id, currentAdminId);
      sendSuccess(res, result, 'Akun Dosen/Pengajar berhasil dihapus.');
    } catch (err) {
      next(err);
    }
  }
}
