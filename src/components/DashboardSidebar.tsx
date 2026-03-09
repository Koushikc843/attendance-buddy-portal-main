import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  ClipboardCheck,
  UserCog,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['student', 'faculty', 'admin'] },
  { icon: Calendar, label: 'My Attendance', path: '/dashboard/attendance', roles: ['student'] },
  { icon: BookOpen, label: 'My Classes', path: '/dashboard/classes', roles: ['student'] },
  { icon: ClipboardCheck, label: 'Mark Attendance', path: '/dashboard/mark-attendance', roles: ['faculty'] },
  { icon: Users, label: 'My Students', path: '/dashboard/students', roles: ['faculty'] },
  { icon: BarChart3, label: 'Reports', path: '/dashboard/reports', roles: ['faculty', 'admin'] },
  { icon: UserCog, label: 'Manage Users', path: '/dashboard/users', roles: ['admin'] },
  { icon: Building2, label: 'Departments', path: '/dashboard/departments', roles: ['admin'] },
  { icon: GraduationCap, label: 'Courses', path: '/dashboard/courses', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', roles: ['student', 'faculty', 'admin'] },
];

export const DashboardSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-glow">
            <ClipboardCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-sidebar-foreground">AttendEase</h1>
            <p className="text-xs text-sidebar-foreground/60">Attendance System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md ring-1 ring-sidebar-primary/40'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1'
              )}
            >
              <span
                className={cn(
                  'absolute left-2 h-7 w-1 rounded-full bg-transparent transition-colors duration-200',
                  isActive && 'bg-sidebar-primary-foreground'
                )}
              />
              <Icon
                className={cn(
                  'w-5 h-5 flex-shrink-0 transition-colors duration-200',
                  isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground'
                )}
              />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full mt-3 justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
