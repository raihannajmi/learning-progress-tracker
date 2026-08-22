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
      const { name, academicTerm } = req.body;
      const data = await ClassService.createClass(name, academicTerm);
      sendSuccess(res, data, 'Kelas berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }
}
