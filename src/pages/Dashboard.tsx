import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { StudentDashboard } from '@/components/dashboards/StudentDashboard';
import { FacultyDashboard } from '@/components/dashboards/FacultyDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  const location = useLocation();
  const isRootDashboard = location.pathname === '/dashboard';

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-64 p-8 animate-fade-in">
        {isRootDashboard ? renderDashboard() : <Outlet />}
      </main>
    </div>
  );
};

export default Dashboard;
