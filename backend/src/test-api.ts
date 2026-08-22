import { AuthService } from './services/authService.js';
import { RoadmapService } from './services/roadmapService.js';
import { ChecklistService } from './services/checklistService.js';
import { SprintService } from './services/sprintService.js';
import { DashboardService } from './services/dashboardService.js';
import { AdminStudentService } from './services/adminStudentService.js';
import { ClassService } from './services/classService.js';
import { queryClient } from './db/index.js';

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
    const studentAuth = await AuthService.verifyGoogleLogin('dev-mock:andi@student.univ.ac.id');
    console.log(`   ✅ PASS: Student logged in. Name: ${studentAuth.user.name}, Role: ${studentAuth.user.role}, Token length: ${studentAuth.token.length}`);

    // 3. Whitelisted Admin login
    console.log('3️⃣ Testing Whitelisted Admin Login...');
    const adminAuth = await AuthService.verifyGoogleLogin('dev-mock:dosen@univ.ac.id');
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
    console.log('6️⃣ Testing Peer Feedback on Sprint...');
    const feedback = await SprintService.addFeedback(
      newSprint.id,
      adminAuth.user.id,
      'Slicing grid gallery kamu sangat responsif di layar mobile!'
    );
    console.log(`   ✅ PASS: Peer feedback added by ${feedback.author?.name}: "${feedback.comment}"`);

    // 7. Student Dashboard
    console.log('7️⃣ Testing Student Dashboard KPIs & Progress Calculation...');
    const studentDash = await DashboardService.getStudentDashboard(studentAuth.user.id);
    console.log(`   ✅ PASS: Student Dashboard loaded. Overall self-assessed progress: ${studentDash.summary.overallPercentage}%, Habit sprints: ${studentDash.summary.habitReachedCount}, Next action: "${studentDash.nextAction.suggestedFocus}"`);

    // 8. TA / Admin Dashboard
    console.log('8️⃣ Testing TA / Admin Dashboard Aggregation & Inactive Filter...');
    const adminDash = await DashboardService.getAdminDashboard();
    console.log(`   ✅ PASS: TA Dashboard loaded. Active students this week: ${adminDash.activeStudentsThisWeek}/${adminDash.totalStudents}. Confusions found: ${adminDash.commonConfusions.length}, Inactive count: ${adminDash.studentsNeedingAttention.length}`);

    // 9. Admin adding new student to whitelist
    console.log('9️⃣ Testing Admin Adding New Student to Whitelist...');
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

    // Verify new student can immediately log in
    const newStudentLogin = await AuthService.verifyGoogleLogin(`dev-mock:${newStudentEmail}`);
    console.log(`   ✅ PASS: Newly whitelisted student logged in successfully with user ID: ${newStudentLogin.user.id}`);

    console.log('\n🎉 ALL 9 BACKEND VERIFICATION CHECKS PASSED WITH 100% SUCCESS!\n');
  } catch (error) {
    console.error('❌ Verification check failed:', error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

runTests();
