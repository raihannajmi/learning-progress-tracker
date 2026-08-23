import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { ClassController } from '../controllers/classController.js';
import { AdminStudentController } from '../controllers/adminStudentController.js';
import { RoadmapController } from '../controllers/roadmapController.js';
import { ChecklistController } from '../controllers/checklistController.js';
import { SprintController } from '../controllers/sprintController.js';
import { DashboardController } from '../controllers/dashboardController.js';
import { RoadmapAdminController } from '../controllers/roadmapAdminController.js';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { googleVerifySchema } from '../validators/authValidators.js';
import {
  createStudentSchema,
  batchCreateStudentSchema,
  updateStudentSchema,
} from '../validators/studentValidators.js';
import {
  createWeekSchema,
  updateWeekSchema,
  reorderWeeksSchema,
  createTopicSchema,
  updateTopicSchema,
  createChecklistSchema,
  updateChecklistSchema,
} from '../validators/roadmapAdminValidators.js';
import { updateChecklistProgressSchema } from '../validators/checklistValidators.js';
import {
  createSprintSchema,
  updateSprintSchema,
  deleteSprintSchema,
  querySprintSchema,
} from '../validators/sprintValidators.js';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  deleteFeedbackSchema,
} from '../validators/feedbackValidators.js';

export const apiRouter: Router = Router();

// 1. Auth routes
apiRouter.post('/auth/google/verify', AuthController.verifyGoogle);
apiRouter.get('/auth/google/verify', AuthController.verifyGoogle);
apiRouter.all('/auth/google/callback', AuthController.verifyGoogle);
apiRouter.get('/auth/me', authenticate, AuthController.getMe);

// 2. Classes
apiRouter.get('/classes', authenticate, ClassController.list);
apiRouter.post('/classes', authenticate, requireRole('ADMIN'), ClassController.create);
apiRouter.patch('/classes/:id', authenticate, requireRole('ADMIN'), ClassController.update);
apiRouter.delete('/classes/:id', authenticate, requireRole('ADMIN'), ClassController.delete);

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

// 3.5. Admin Roadmap & Checklist Management (CRUD)
apiRouter.post(
  '/admin/roadmap/weeks',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(createWeekSchema),
  RoadmapAdminController.createWeek
);
apiRouter.patch(
  '/admin/roadmap/weeks/reorder',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(reorderWeeksSchema),
  RoadmapAdminController.reorderWeeks
);
apiRouter.patch(
  '/admin/roadmap/weeks/:id',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateWeekSchema),
  RoadmapAdminController.updateWeek
);
apiRouter.patch(
  '/admin/roadmap/weeks/:id/current',
  authenticate,
  requireRole('ADMIN'),
  RoadmapAdminController.setCurrentWeek
);
apiRouter.delete(
  '/admin/roadmap/weeks/:id',
  authenticate,
  requireRole('ADMIN'),
  RoadmapAdminController.deleteWeek
);

apiRouter.post(
  '/admin/roadmap/topics',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(createTopicSchema),
  RoadmapAdminController.createTopic
);
apiRouter.patch(
  '/admin/roadmap/topics/:id',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateTopicSchema),
  RoadmapAdminController.updateTopic
);
apiRouter.delete(
  '/admin/roadmap/topics/:id',
  authenticate,
  requireRole('ADMIN'),
  RoadmapAdminController.deleteTopic
);

apiRouter.post(
  '/admin/roadmap/checklists',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(createChecklistSchema),
  RoadmapAdminController.createChecklist
);
apiRouter.patch(
  '/admin/roadmap/checklists/:id',
  authenticate,
  requireRole('ADMIN'),
  validateRequest(updateChecklistSchema),
  RoadmapAdminController.updateChecklist
);
apiRouter.delete(
  '/admin/roadmap/checklists/:id',
  authenticate,
  requireRole('ADMIN'),
  RoadmapAdminController.deleteChecklist
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
apiRouter.patch(
  '/sprints/:id',
  authenticate,
  validateRequest(updateSprintSchema),
  SprintController.update
);
apiRouter.delete(
  '/sprints/:id',
  authenticate,
  validateRequest(deleteSprintSchema),
  SprintController.delete
);
apiRouter.post(
  '/sprints/:id/feedbacks',
  authenticate,
  validateRequest(createFeedbackSchema),
  SprintController.addFeedback
);
apiRouter.patch(
  '/sprints/:id/feedbacks/:feedbackId',
  authenticate,
  validateRequest(updateFeedbackSchema),
  SprintController.updateFeedback
);
apiRouter.delete(
  '/sprints/:id/feedbacks/:feedbackId',
  authenticate,
  validateRequest(deleteFeedbackSchema),
  SprintController.deleteFeedback
);

// 5.5. Admin / Instructor Review Queue & Feedback
apiRouter.get(
  '/admin/reviews',
  authenticate,
  requireRole('ADMIN'),
  SprintController.listReviews
);
apiRouter.post(
  '/admin/reviews/:sprintId',
  authenticate,
  requireRole('ADMIN'),
  SprintController.submitReview
);

// 6. Dashboards
apiRouter.get('/dashboard/student', authenticate, DashboardController.getStudentDashboard);
apiRouter.get(
  '/dashboard/admin',
  authenticate,
  requireRole('ADMIN'),
  DashboardController.getAdminDashboard
);
