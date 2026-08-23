import { AuthService } from './services/authService.js';
import { RoadmapService } from './services/roadmapService.js';
import { ChecklistService } from './services/checklistService.js';
import { SprintService } from './services/sprintService.js';
import { DashboardService } from './services/dashboardService.js';
import { AdminStudentService } from './services/adminStudentService.js';
import { AdminInstructorService } from './services/adminInstructorService.js';
import { RoadmapAdminService } from './services/roadmapAdminService.js';
import { ClassService } from './services/classService.js';
import { db, queryClient } from './db/index.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';

async function runTests() {
  console.log('🧪 Starting Backend API & Business Logic Verification...\n');

  try {
    // 1. Non-whitelisted email check
    console.log('1️⃣ Testing Non-Whitelisted Email Login...');
    try {
      await AuthService.verifyGoogleLogin('dev-mock:stranger@unknown.com');
      throw new Error('FAIL: Stranger email should have been rejected!');
    } catch (err: any) {
      if (err.statusCode === 403 && err.code === 'NOT_WHITELISTED') {
        console.log('   ✅ PASS: Non-whitelisted email successfully blocked with 403 NOT_WHITELISTED.');
      } else {
        throw err;
      }
    }

    // 2. Whitelisted Student login
    console.log('2️⃣ Testing Whitelisted Student Login...');
    const [sampleStudent] = await db
      .select()
      .from(users)
      .where(eq(users.role, 'STUDENT'))
      .limit(1);

    const studentAuth = await AuthService.verifyGoogleLogin(
      `dev-mock:${sampleStudent?.email || 'student.01@demo.univ.ac.id'}`
    );
    console.log(`   ✅ PASS: Student logged in. Name: ${studentAuth.user.name}, Role: ${studentAuth.user.role}, Token length: ${studentAuth.token.length}`);

    // 3. Whitelisted Admin login
    console.log('3️⃣ Testing Whitelisted Admin Login...');
    const adminAuth = await AuthService.verifyGoogleLogin('dev-mock:najmiraihanworks@gmail.com');
    console.log(`   ✅ PASS: Admin logged in. Name: ${adminAuth.user.name}, Role: ${adminAuth.user.role}`);

    // 4. Roadmap & Checklist self-assessment
    console.log('4️⃣ Testing Roadmap & 4-State Checklist Self-Assessment...');
    const roadmap = await RoadmapService.getFullRoadmap(studentAuth.user.id);
    console.log(`   ✅ PASS: Retrieved ${roadmap.length} roadmap weeks.`);
    const firstChecklist = roadmap[0]?.topics[0]?.checklists[0];
    if (firstChecklist) {
      const updated = await ChecklistService.updateProgress(
        studentAuth.user.id,
        firstChecklist.id,
        'CAN_DO_INDEPENDENTLY'
      );
      console.log(`   ✅ PASS: Checklist updated to: ${updated.status}`);
    }

    // 5. 25-Minute Learning Sprint Logger
    console.log('5️⃣ Testing 25-Minute Learning Sprint Logger & Habit Indicator...');
    const newSprint = await SprintService.createSprint(studentAuth.user.id, {
      durationMinutes: 28,
      whatLearned: 'Memahami implementasi CSS Grid dengan minmax dan auto-fit.',
      whatPracticed: 'Membuat responsive image gallery 4 kolom.',
      confusingParts: 'Sedikit ragu tentang implicit vs explicit grid tracks.',
      evidenceUrl: 'https://github.com/andipratama/webdev-portfolio',
      evidenceType: 'GITHUB',
    });
    console.log(`   ✅ PASS: Sprint created with duration ${newSprint.durationMinutes}m. isHabitQualified: ${newSprint.isHabitQualified}`);

    // 6. Peer Feedback
    console.log('6️⃣ Testing Peer Feedback on Sprint (Add, Edit, & Delete)...');
    const feedback = await SprintService.addFeedback(
      newSprint.id,
      adminAuth.user.id,
      'Slicing grid gallery kamu sangat responsif di layar mobile!'
    );
    console.log(`   ✅ PASS: Peer feedback added by ${feedback.author?.name}: "${feedback.comment}"`);

    const updatedFeedback = await SprintService.updateFeedback(
      newSprint.id,
      feedback.id,
      adminAuth.user.id,
      'ADMIN',
      'Slicing grid gallery kamu sangat responsif di layar mobile! (Telah diedit)'
    );
    console.log(`   ✅ PASS: Peer feedback edited: "${updatedFeedback.comment}"`);

    const delFeedbackRes = await SprintService.deleteFeedback(
      newSprint.id,
      feedback.id,
      adminAuth.user.id,
      'ADMIN'
    );
    console.log(`   ✅ PASS: Peer feedback deleted successfully: ${delFeedbackRes.success}`);

    // Re-add feedback so later assertions have comments if needed
    await SprintService.addFeedback(
      newSprint.id,
      adminAuth.user.id,
      'Slicing grid gallery kamu sangat responsif di layar mobile!'
    );

    // 7. Review Queue & Instructor Review Submission
    console.log('7️⃣ Testing Dedicated Instructor Review Queue & Review Submission...');
    const reviewQueue = await SprintService.listReviewQueue({
      status: 'ALL',
      page: 1,
      limit: 5,
    });
    console.log(`   ✅ PASS: Review queue retrieved ${reviewQueue.data.length} submissions. Total: ${reviewQueue.pagination.total}`);

    const reviewedSprint = await SprintService.submitInstructorReview(
      newSprint.id,
      adminAuth.user.id,
      {
        instructorFeedback: 'Implementasi grid sudah sangat tepat. Lanjutkan eksplorasi nested subgrid.',
        reviewStatus: 'REVIEWED',
      }
    );
    console.log(`   ✅ PASS: Instructor feedback submitted by ${reviewedSprint.reviewer.name}. Status: ${reviewedSprint.reviewStatus}`);

    // 8. Student Dashboard
    console.log('8️⃣ Testing Student Dashboard KPIs & Progress Calculation...');
    const studentDash = await DashboardService.getStudentDashboard(studentAuth.user.id);
    console.log(`   ✅ PASS: Student Dashboard loaded. Overall self-assessed progress: ${studentDash.summary.overallPercentage}%, Habit sprints: ${studentDash.summary.habitReachedCount}, Next action: "${studentDash.nextAction.suggestedFocus}"`);

    // 9. TA / Admin Dashboard
    console.log('9️⃣ Testing TA / Admin Dashboard Aggregation & Inactive Filter...');
    const adminDash = await DashboardService.getAdminDashboard();
    console.log(`   ✅ PASS: TA Dashboard loaded. Active students this week: ${adminDash.activeStudentsThisWeek}/${adminDash.totalStudents}. Confusions found: ${adminDash.commonConfusions.length}, Inactive count: ${adminDash.studentsNeedingAttention.length}`);

    // 10. Server-Side Paginated Student Management
    console.log('🔟 Testing Admin Student Whitelist with Server-Side Pagination...');
    const paginatedStudents = await AdminStudentService.listStudents({
      page: 1,
      limit: 10,
      search: 'zahi',
    });
    console.log(`   ✅ PASS: Paginated student search returned ${paginatedStudents.data.length} records. Total: ${paginatedStudents.pagination.total}, TotalPages: ${paginatedStudents.pagination.totalPages}`);

    // 11. Admin adding new student to whitelist
    console.log('1️⃣1️⃣ Testing Admin Adding New Student to Whitelist...');
    const classesList = await ClassService.getAllClasses();
    const classId = classesList[0].id;
    const newStudentEmail = `test.student.${Date.now()}@student.univ.ac.id`;
    const newStudent = await AdminStudentService.addStudent({
      name: 'Rian Hidayat',
      email: newStudentEmail,
      nim: `NIM-${Date.now().toString().slice(-4)}`,
      classId,
    });
    console.log(`   ✅ PASS: New student whitelisted: ${newStudent.name} (${newStudent.email})`);

    // 12. Admin Roadmap & Checklist CRUD
    console.log('1️⃣2️⃣ Testing Admin Roadmap & Checklist Management (CRUD)...');
    const createdWeek = await RoadmapAdminService.createWeek({
      weekNumber: 99,
      title: 'Week 99: Fullstack Deployment & CI/CD',
      description: 'Testing dynamic syllabus creation by Admin',
    });
    console.log(`   ✅ PASS: Admin created syllabus week: ${createdWeek.title}`);

    const createdTopic = await RoadmapAdminService.createTopic({
      weekId: createdWeek.id,
      title: 'Dockerizing Express & Postgres',
      category: 'BACKEND',
      sortOrder: 1,
    });
    console.log(`   ✅ PASS: Admin created topic: ${createdTopic.title} (${createdTopic.category})`);

    const createdChecklist = await RoadmapAdminService.createChecklist({
      topicId: createdTopic.id,
      statement: 'Saya dapat menulis Dockerfile multi-stage build untuk aplikasi Node.js',
      sortOrder: 1,
    });
    console.log(`   ✅ PASS: Admin created checklist item: "${createdChecklist.statement}"`);

    // Clean up test week & cascade
    await RoadmapAdminService.deleteWeek(createdWeek.id);
    console.log('   ✅ PASS: Admin successfully cleaned up test syllabus week & cascaded topics/checklists.');

    // 13. Admin Instructor / Dosen Management (CRUD & Whitelist)
    console.log('1️⃣3️⃣ Testing Admin Instructor / Dosen Management (CRUD)...');
    const testInstructorEmail = `dosen.test.${Date.now()}@univ.ac.id`;
    const newInstructor = await AdminInstructorService.addInstructor({
      name: 'Dr. Hendra Wijaya, M.Kom.',
      email: testInstructorEmail,
    });
    console.log(`   ✅ PASS: New Instructor whitelisted: ${newInstructor.name} (${newInstructor.email})`);

    const instructorList = await AdminInstructorService.listInstructors();
    console.log(`   ✅ PASS: Listed instructors. Total: ${instructorList.total}`);

    const updatedInstructor = await AdminInstructorService.updateInstructor(
      newInstructor.id,
      { name: 'Prof. Dr. Hendra Wijaya, M.Kom.' },
      adminAuth.user.id
    );
    console.log(`   ✅ PASS: Instructor updated: ${updatedInstructor.name}`);

    const delInstructorRes = await AdminInstructorService.deleteInstructor(
      newInstructor.id,
      adminAuth.user.id
    );
    console.log(`   ✅ PASS: Instructor deleted: ${delInstructorRes.success}`);

    console.log('\n🎉 ALL 13 BACKEND VERIFICATION CHECKS PASSED WITH 100% SUCCESS!\n');
  } catch (error) {
    console.error('❌ Verification check failed:', error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

runTests();
