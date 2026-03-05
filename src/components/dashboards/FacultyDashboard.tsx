import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { AttendanceChart } from '@/components/AttendanceChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, ClipboardCheck, TrendingUp, ChevronRight } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

import { QRScanner } from '@/components/QRScanner';

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenScanner = (e: Event) => {
      const customEvent = e as CustomEvent;
      setActiveSession(customEvent.detail.sessionId);
      setScannerOpen(true);
    };
    window.addEventListener('open-scanner', handleOpenScanner);
    return () => window.removeEventListener('open-scanner', handleOpenScanner);
  }, []);

  useEffect(() => {
    if (user) {
      fetchApi(`/dashboard/faculty/${user.id}`)
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch dashboard data', err);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center bg-background min-h-screen text-foreground">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load dashboard data.</div>;
  }

  // Fallback for empty array in mock data
  const classData = [
    { name: 'CS101', value: 92 },
    { name: 'CS201', value: 88 },
  ];

  const lowAttendanceStudents = data.students.slice(0, 3).map((s: any, i: number) => ({
    ...s,
    course: ['CS201', 'CS301', 'CS401'][Math.min(i, 2)],
    attendance: [62, 58, 65][Math.min(i, 2)],
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your classes and track student attendance
          </p>
        </div>
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate('/dashboard/mark-attendance')}
        >
          <ClipboardCheck className="w-5 h-5 mr-2" />
          Quick Mark Attendance
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={data.totalStudents}
          subtitle="In your classes"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Classes Today"
          value={data.classesToday}
          subtitle="Pending"
          icon={BookOpen}
          variant="accent"
        />
        <StatCard
          title="Avg Attendance"
          value={`${data.avgAttendance}%`}
          subtitle="This month"
          icon={TrendingUp}
          variant="success"
          trend={{ value: 2.5, isPositive: true }}
        />
        <StatCard
          title="Sessions Marked"
          value={data.sessionsMarked}
          subtitle="This month"
          icon={ClipboardCheck}
          variant="default"
        />
      </div>

      {/* Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart type="bar" title="Attendance by Class" data={classData} />

        {/* Today's Classes */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
            <Button variant="ghost" size="sm">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.todayClasses.map((cls: any) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/30 transition-all"
                >
                  <div>
                    <h4 className="font-medium text-foreground">{cls.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cls.time} • {cls.students} students
                    </p>
                  </div>
                  <Button
                    variant={cls.marked ? 'secondary' : 'default'}
                    size="sm"
                    disabled={cls.marked}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-scanner', { detail: { sessionId: cls.id } }));
                    }}
                  >
                    {cls.marked ? 'Marked' : 'Scan to Mark'}
                  </Button>
                </div>
              ))}
              {data.todayClasses.length === 0 && (
                <div className="text-center text-muted-foreground p-4">No pending classes today.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student List */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Your Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.students.map((student: any) => (
              <div
                key={student.id}
                className="p-4 bg-secondary/30 rounded-xl border border-border hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg mb-3">
                  {student.name.charAt(0)}
                </div>
                <h4 className="font-medium text-foreground">{student.name}</h4>
                <p className="text-sm text-muted-foreground break-all">{student.email}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Low Attendance Alert */}
      {lowAttendanceStudents.length > 0 && (
        <Card className="shadow-sm border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              Students with Low Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {lowAttendanceStudents.map((student: any) => (
                <div
                  key={student.id}
                  className="p-4 bg-card rounded-xl border border-border"
                >
                  <h4 className="font-medium text-foreground">{student.name}</h4>
                  <p className="text-sm text-muted-foreground">{student.course}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-yellow-600">{student.attendance}%</span>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <QRScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        sessionId={activeSession}
        onSuccess={() => {
          // refresh data
          if (user) {
            fetchApi(`/dashboard/faculty/${user.id}`).then(setData);
          }
        }}
      />
    </div>
  );
};
