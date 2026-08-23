import { Request, Response, NextFunction } from 'express';
import { AdminStudentService } from '../services/adminStudentService.js';
import { sendSuccess } from '../utils/response.js';

export class AdminStudentController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, search, status, page, limit } = req.query as {
        classId?: string;
        search?: string;
        status?: 'all' | 'active' | 'inactive';
        page?: string;
        limit?: string;
      };
      const result = await AdminStudentService.listStudents({
        classId,
        search,
        status,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
      });
      sendSuccess(res, result.data, 'Daftar mahasiswa terdaftar', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AdminStudentService.addStudent(req.body);
      sendSuccess(res, data, 'Mahasiswa berhasil didaftarkan', 201);
    } catch (error) {
      next(error);
    }
  }

  static async batchCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, students } = req.body;
      const data = await AdminStudentService.batchAddStudents(classId, students);
      sendSuccess(res, data, 'Proses batch pendaftaran selesai');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await AdminStudentService.updateStudent(id, req.body);
      sendSuccess(res, data, 'Data mahasiswa berhasil diperbarui');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data = await AdminStudentService.deleteStudent(id);
      sendSuccess(res, data, 'Mahasiswa berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }
}
