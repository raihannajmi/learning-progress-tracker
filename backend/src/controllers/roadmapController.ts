import { Request, Response, NextFunction } from 'express';
import { RoadmapService } from '../services/roadmapService.js';
import { sendSuccess } from '../utils/response.js';

export class RoadmapController {
  static async getRoadmap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const data = await RoadmapService.getFullRoadmap(userId);
      sendSuccess(res, data, 'Silabus Roadmap Pembelajaran');
    } catch (error) {
      next(error);
    }
  }
}
