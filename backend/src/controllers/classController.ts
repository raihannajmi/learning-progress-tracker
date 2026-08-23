import { Request, Response, NextFunction } from 'express';
import { ClassService } from '../services/classService.js';
import { sendSuccess } from '../utils/response.js';

export class ClassController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await ClassService.getAllClasses();
      sendSuccess(res, data, 'Daftar kelas');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, academicTerm, startDate } = req.body;
      const data = await ClassService.createClass(
        name,
        academicTerm,
        startDate ? new Date(startDate) : undefined
      );
      sendSuccess(res, data, 'Kelas berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { name, academicTerm, startDate } = req.body;
      const data = await ClassService.updateClass(id, {
        name,
        academicTerm,
        startDate: startDate ? new Date(startDate) : startDate === null ? null : undefined,
      });
      sendSuccess(res, data, 'Kelas berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await ClassService.deleteClass(id);
      sendSuccess(res, data, 'Kelas berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }
}
