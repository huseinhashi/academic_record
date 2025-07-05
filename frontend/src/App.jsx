// App.jsx - Updated with consolidated login system
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TermsAndConditions } from "@/pages/TermsAndConditions";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Toaster } from "@/components/ui/toaster";

// Dashboard Pages
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminUsers } from "@/pages/admin/Admins";
import { AdminStudents } from "@/pages/admin/Students";
import { AdminInstitutions } from "@/pages/admin/Institutions";
import { AdminCompanies } from "@/pages/admin/Companies";
import { AdminRecords } from "@/pages/admin/Records";
import { AdminJobs } from "@/pages/admin/Jobs";
import { AdminApplications } from "@/pages/admin/Applications";
import { AdminReports } from "@/pages/admin/Reports";
import { 
  StudentDashboard, 
  StudentRecords, 
  StudentAcademic,
  StudentJobs 
} from "@/pages/student";
import { StudentNotifications } from "@/pages/student/Notifications";
import { InstitutionDashboard } from "@/pages/institution/Dashboard";
import { InstitutionStudents } from "@/pages/institution/Students";
import { InstitutionRecords } from "@/pages/institution/Records";
import { InstitutionNotifications } from "@/pages/institution/Notifications";
import { CompanyDashboard } from "@/pages/company/Dashboard";
import { CompanyJobs } from "@/pages/company/Jobs";
import { JobDetails as CompanyJobDetails } from "@/pages/company/JobDetails";
import { CompanyNotifications } from "@/pages/company/Notifications";
import { VerificationPending } from "@/pages/company/VerificationPending";
import { InstitutionVerificationPending } from "@/pages/institution/VerificationPending";
import { ScheduleInterview } from "@/pages/company/ScheduleInterview";
import { UpcomingInterviews } from "@/pages/company/UpcomingInterviews";
import { PastInterviews } from "@/pages/company/PastInterviews";
import { Profile } from "@/pages/Profile";
import { HelpSupport } from "@/pages/HelpSupport";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect root to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminUsers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users/admins"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminUsers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users/students"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminStudents />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users/institutions"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminInstitutions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/users/companies"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminCompanies />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/records"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminRecords />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/jobs"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminJobs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminApplications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredType="Admin">
                <DashboardLayout>
                  <AdminReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredType="Student">
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/records"
            element={
              <ProtectedRoute requiredType="Student">
                <DashboardLayout>
                  <StudentRecords />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/academic"
            element={
              <ProtectedRoute requiredType="Student">
                <DashboardLayout>
                  <StudentAcademic />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/jobs"
            element={
              <ProtectedRoute requiredType="Student">
                <DashboardLayout>
                  <StudentJobs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/notifications"
            element={
              <ProtectedRoute requiredType="Student">
                <DashboardLayout>
                  <StudentNotifications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Institution Routes */}
          <Route
            path="/institution/verification-pending"
            element={
              <ProtectedRoute requiredType="Institution">
                <InstitutionVerificationPending />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/institution/dashboard"
            element={
              <ProtectedRoute requiredType="Institution" requireVerification>
                <DashboardLayout>
                  <InstitutionDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/institution/students"
            element={
              <ProtectedRoute requiredType="Institution" requireVerification>
                <DashboardLayout>
                  <InstitutionStudents />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/institution/records"
            element={
              <ProtectedRoute requiredType="Institution" requireVerification>
                <DashboardLayout>
                  <InstitutionRecords />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/institution/notifications"
            element={
              <ProtectedRoute requiredType="Institution" requireVerification>
                <DashboardLayout>
                  <InstitutionNotifications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Company Routes */}
          <Route
            path="/company/verification-pending"
            element={
              <ProtectedRoute requiredType="Company">
                <VerificationPending />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute requiredType="Company" requireVerification>
                <DashboardLayout>
                  <CompanyDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute requiredType="Company" requireVerification>
                <DashboardLayout>
                  <CompanyJobs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/jobs/:jobId"
            element={
              <ProtectedRoute requiredType="Company" requireVerification>
                <DashboardLayout>
                  <CompanyJobDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/interviews/schedule"
            element={
              <ProtectedRoute requiredType="Company" requireVerification>
                <DashboardLayout>
                  <ScheduleInterview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/interviews/upcoming"
            element={
              <ProtectedRoute requiredType="Company" requireVerification>
                <DashboardLayout>
                  <UpcomingInterviews />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/interviews/past"
            element={
              <ProtectedRoute requiredType="Company" requireVerification>
                <DashboardLayout>
                  <PastInterviews />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/notifications"
            element={
              <ProtectedRoute requiredType="Company" requireVerification>
                <DashboardLayout>
                  <CompanyNotifications />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Profile Route */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Help & Support Route */}
          <Route
            path="/help-support"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <HelpSupport />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Terms and Conditions Route */}
          <Route
            path="/settings/terms"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TermsAndConditions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App; 