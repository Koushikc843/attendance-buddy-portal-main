import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

import AttendanceLayout from "./pages/dashboard/AttendanceLayout";
import ClassesLayout from "./pages/dashboard/ClassesLayout";
import MarkAttendanceLayout from "./pages/dashboard/MarkAttendanceLayout";
import StudentsLayout from "./pages/dashboard/StudentsLayout";
import ReportsLayout from "./pages/dashboard/ReportsLayout";
import UsersLayout from "./pages/dashboard/UsersLayout";
import DepartmentsLayout from "./pages/dashboard/DepartmentsLayout";
import CoursesLayout from "./pages/dashboard/CoursesLayout";
import SettingsLayout from "./pages/dashboard/SettingsLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route path="attendance" element={<AttendanceLayout />} />
              <Route path="classes" element={<ClassesLayout />} />
              <Route path="mark-attendance" element={<MarkAttendanceLayout />} />
              <Route path="students" element={<StudentsLayout />} />
              <Route path="reports" element={<ReportsLayout />} />
              <Route path="users" element={<UsersLayout />} />
              <Route path="departments" element={<DepartmentsLayout />} />
              <Route path="courses" element={<CoursesLayout />} />
              <Route path="settings" element={<SettingsLayout />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
