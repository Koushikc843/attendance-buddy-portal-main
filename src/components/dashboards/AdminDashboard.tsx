import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { AttendanceChart } from '@/components/AttendanceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  TrendingUp,
  UserPlus,
  FileSpreadsheet,
  Settings,
  UserCheck,
  UserX
} from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { AddUserDialog } from '@/components/dashboards/AddUserDialog';
import { Trash2 } from 'lucide-react';

const departmentData = [
  { name: 'CS', value: 85 },
  { name: 'ECE', value: 78 },
  { name: 'ME', value: 82 },
];

const monthlyTrend = [
  { name: 'Jan', value: 75 },
  { name: 'Feb', value: 80 },
  { name: 'Mar', value: 85 },
  { name: 'Apr', value: 82 },
  { name: 'May', value: 88 },
  { name: 'Jun', value: 92 },
];

const quickActions = [
  { icon: UserPlus, label: 'Add User', description: 'Create new student or faculty', action: 'ADD_USER' },
  { icon: FileSpreadsheet, label: 'Generate Report', description: 'Export attendance data' },
  { icon: Building2, label: 'Manage Departments', description: 'Add or edit departments' },
  { icon: Settings, label: 'System Settings', description: 'Configure system options' },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [pendingStudents, setPendingStudents] = useState<any[]>([]);
  const [pendingFaculty, setPendingFaculty] = useState<any[]>([]);
  const { toast } = useToast();

  const loadData = () => {
    fetchApi(`/dashboard/admin`)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch admin dashboard data', err);
        setLoading(false);
      });

    fetchApi(`/admin/users/pending/student`)
      .then(res => setPendingStudents(res.data || []))
      .catch(err => console.error(err));

    fetchApi(`/admin/users/pending/faculty`)
      .then(res => setPendingFaculty(res.data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    try {
      await fetchApi(`/admin/users/${id}`, { method: 'DELETE' });
      toast({ title: 'Deleted', description: `${name} has been removed successfully.` });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete user.', variant: 'destructive' });
    }
  };

  const handleApprovalAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      const method = action === 'approve' ? 'PATCH' : 'DELETE';
      const endpoint =
        action === 'approve'
          ? `/admin/users/${id}/approve`
          : `/admin/users/${id}/reject`;

      const res = await fetchApi(endpoint, { method });
      toast({
        title: res.success ? 'Success' : 'Error',
        description: res.message || `User ${action} operation completed.`,
        variant: res.success ? 'default' : 'destructive',
      });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || `Failed to ${action} user.`, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="p-8 text-center bg-background min-h-screen text-foreground">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load dashboard data.</div>;
  }

  const students = data.students;
  const faculty = data.faculty;
  const admin = data.admin;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard 🎛️
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {user?.name}! System overview and management console
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <Button variant="default" onClick={() => setAddUserOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Active enrollments"
          icon={GraduationCap}
          variant="primary"
        />
        <StatCard
          title="Faculty Members"
          value={faculty.length}
          subtitle="Teaching staff"
          icon={Users}
          variant="accent"
        />
        <StatCard
          title="Administrators"
          value={admin.length}
          subtitle="System admins"
          icon={Building2}
          variant="success"
        />
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          subtitle="All users"
          icon={BookOpen}
          variant="default"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.label}
              className="shadow-sm cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all group"
              onClick={() => {
                if (action.action === 'ADD_USER') setAddUserOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart type="bar" title="Attendance by Department" data={departmentData} />
        <AttendanceChart type="bar" title="Monthly Attendance Trend" data={monthlyTrend} />
      </div>

      {/* Pending Approvals */}
      {(pendingStudents.length > 0 || pendingFaculty.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 border-b border-border">
          {pendingStudents.length > 0 && (
            <Card className="shadow-sm border-warning/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-warning" />
                  Pending Students ({pendingStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 h-[250px] overflow-y-auto pr-2">
                  {pendingStudents.map((student: any) => (
                    <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-border bg-warning/5 transition-colors gap-3">
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email} • {student.department}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => handleApprovalAction(student.id, 'reject')}>
                          <UserX className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleApprovalAction(student.id, 'approve')}>
                          <UserCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {pendingFaculty.length > 0 && (
            <Card className="shadow-sm border-indigo-500/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-500" />
                  Pending Faculty ({pendingFaculty.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 h-[250px] overflow-y-auto pr-2">
                  {pendingFaculty.map((fac: any) => (
                    <div key={fac.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-border bg-indigo-500/5 transition-colors gap-3">
                      <div>
                        <p className="font-medium text-foreground">{fac.name}</p>
                        <p className="text-xs text-muted-foreground">{fac.email} • {fac.department}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white" onClick={() => handleApprovalAction(fac.id, 'reject')}>
                          <UserX className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleApprovalAction(fac.id, 'approve')}>
                          <UserCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* All Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Students */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground break-all">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                      Student
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteUser(student.id, student.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Faculty */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Faculty ({faculty.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 h-[300px] overflow-y-auto pr-2">
              {faculty.map((fac: any) => (
                <div
                  key={fac.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                      {fac.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{fac.name}</p>
                      <p className="text-sm text-muted-foreground break-all">{fac.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 shrink-0">
                      Faculty
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteUser(fac.id, fac.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Stats */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-xl border border-green-500/20">
            <div>
              <p className="font-medium text-foreground">Overall Attendance Rate</p>
              <p className="text-sm text-muted-foreground">All departments combined</p>
            </div>
            <span className="text-3xl font-bold text-green-600">{data.overallAttendanceRate}%</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div>
              <p className="font-medium text-foreground">Active Sessions Today</p>
              <p className="text-sm text-muted-foreground">Classes in progress</p>
            </div>
            <span className="text-3xl font-bold text-primary">{data.activeSessionsToday}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
            <div>
              <p className="font-medium text-foreground">Pending Approvals</p>
              <p className="text-sm text-muted-foreground">Leave requests</p>
            </div>
            <span className="text-3xl font-bold text-yellow-600">{data.pendingApprovals}</span>
          </div>
        </CardContent>
      </Card>

      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onSuccess={loadData}
      />
    </div>
  );
};
