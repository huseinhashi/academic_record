// App.jsx - Updated with consolidated login system
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Toaster } from "@/components/ui/toaster";

// Dashboard Pages
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminUsers } from "@/pages/admin/Users";
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
import { InstitutionDashboard } from "@/pages/institution/Dashboard";
import { InstitutionStudents } from "@/pages/institution/Students";
import { InstitutionRecords } from "@/pages/institution/Records";
import { CompanyDashboard } from "@/pages/company/Dashboard";
import { CompanyJobs } from "@/pages/company/Jobs";

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
          
          {/* Institution Routes */}
          <Route
            path="/institution/dashboard"
            element={
              <ProtectedRoute requiredType="Institution">
                <DashboardLayout>
                  <InstitutionDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/institution/students"
            element={
              <ProtectedRoute requiredType="Institution">
                <DashboardLayout>
                  <InstitutionStudents />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/institution/records"
            element={
              <ProtectedRoute requiredType="Institution">
                <DashboardLayout>
                  <InstitutionRecords />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Company Routes */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute requiredType="Company">
                <DashboardLayout>
                  <CompanyDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/company/jobs"
            element={
              <ProtectedRoute requiredType="Company">
                <DashboardLayout>
                  <CompanyJobs />
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