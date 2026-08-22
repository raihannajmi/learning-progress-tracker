import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { ClassController } from '../controllers/classController.js';
import { AdminStudentController } from '../controllers/adminStudentController.js';
import { RoadmapController } from '../controllers/roadmapController.js';
import { ChecklistController } from '../controllers/checklistController.js';
import { SprintController } from '../controllers/sprintController.js';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { googleVerifySchema } from '../validators/authValidators.js';
import {
  createStudentSchema,
  batchCreateStudentSchema,
  updateStudentSchema,
} from '../validators/studentValidators.js';
import { updateChecklistProgressSchema } from '../validators/checklistValidators.js';
import { createSprintSchema, querySprintSchema } from '../validators/sprintValidators.js';
import { createFeedbackSchema } from '../validators/feedbackValidators.js';

export const apiRouter: Router = Router();

// 1. Auth routes
apiRouter.post(
  '/auth/google/verify',
  validateRequest(googleVerifySchema),
  AuthController.verifyGoogle
);
apiRouter.get('/auth/me', authenticate, AuthController.getMe);

// 2. Classes
apiRouter.get('/classes', authenticate, ClassController.list);
apiRouter.post('/classes', authenticate, requireRole('ADMIN'), ClassController.create);

// 3. Admin student management (whitelist)
apiRouter.get('/admin/students', authenticate, requireRole('ADMIN'), AdminStudentController.list);
apiRouter.post(
  '/admin/students',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(createStudentSchema),
  AdminStudentController.create
);
apiRouter.post(
  '/admin/students/batch',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(batchCreateStudentSchema),
  AdminStudentController.batchCreate
);
apiRouter.patch(
  '/admin/students/:id',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateStudentSchema),
  AdminStudentController.update
);
apiRouter.delete(
  '/admin/students/:id',
  authenticate,
  requireRole('ADMIN'),
  AdminStudentController.delete
);

// 4. Roadmap & Checklists
apiRouter.get('/roadmap', authenticate, RoadmapController.getRoadmap);
apiRouter.get('/checklists/my-progress', authenticate, ChecklistController.getMyProgress);
apiRouter.post(
  '/checklists/progress',
  authenticate,
  validateRequest(updateChecklistProgressSchema),
  ChecklistController.updateProgress
);

// 5. Learning Sprints & Peer Feedback
apiRouter.get(
  '/sprints',
  authenticate,
  validateRequest(querySprintSchema),
  SprintController.list
);
apiRouter.post(
  '/sprints',
  authenticate,
  validateRequest(createSprintSchema),
  SprintController.create
);
apiRouter.get('/sprints/:id', authenticate, SprintController.getById);
apiRouter.post(
  '/sprints/:id/feedbacks',
  authenticate,
  validateRequest(createFeedbackSchema),
  SprintController.addFeedback
);

// 6. Dashboards
apiRouter.get('/dashboard/student', authenticate, DashboardController.getStudentDashboard);
apiRouter.get(
  '/dashboard/admin',
  authenticate,
  requireRole('ADMIN'),
  DashboardController.getAdminDashboard
);
