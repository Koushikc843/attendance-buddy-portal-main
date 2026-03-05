import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/StatCard';
import { AttendanceChart } from '@/components/AttendanceChart';
import { RecentActivity } from '@/components/RecentActivity';
import { UpcomingClasses } from '@/components/UpcomingClasses';
import { Calendar as CalendarIcon, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import QRCode from 'react-qr-code';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApi(`/dashboard/student/${user.id}`)
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

  const downloadQR = () => {
    const svg = document.getElementById("student-qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    // Add white background when converting
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "My_Attendance_QR.png";
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading) {
    return <div className="p-8 text-center bg-background min-h-screen text-foreground">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-destructive">Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your attendance this semester
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Overall Attendance"
          value={`${data.overallAttendance}%`}
          subtitle="This semester"
          icon={CalendarIcon}
          variant="primary"
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="Classes Attended"
          value={data.classesAttended.toString()}
          subtitle={`Out of ${data.totalClasses} classes`}
          icon={CheckCircle}
          variant="success"
        />
        <StatCard
          title="Absent Days"
          value={data.absentDays.toString()}
          subtitle="This semester"
          icon={XCircle}
          variant="default"
        />
        <StatCard
          title="Late Arrivals"
          value={data.lateArrivals.toString()}
          subtitle="This semester"
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Visual Progress & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Attendance Progress</h2>
              <p className="text-sm text-muted-foreground">Keep your attendance above the required threshold.</p>
            </div>
            <span className="text-2xl font-bold text-primary">{data.overallAttendance}%</span>
          </div>
          <Progress value={data.overallAttendance} />
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-2">Attendance Calendar</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Hover over dates to view your recent attendance pattern.
          </p>
          <Calendar
            mode="single"
            selected={undefined}
            modifiers={{
              present: (data.recentActivities || []).filter((r: any) => r.type === 'present').map((r: any) => new Date(r.date)),
              absent: (data.recentActivities || []).filter((r: any) => r.type === 'absent').map((r: any) => new Date(r.date)),
            }}
          />
        </div>
      </div>

      {/* Quick QR Code Row */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">Your Attendance QR Code</h2>
            <p className="text-muted-foreground max-w-md">Present this QR code to your faculty to securely mark your attendance. This code is uniquely generated for your account.</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-inner shrink-0 text-center flex flex-col items-center">
            {user?.qrToken ? (
              <>
                <QRCode
                  id="student-qr-code"
                  value={JSON.stringify({
                    studentId: user.id,
                    studentName: user.name,
                    email: user.email,
                  })}
                  size={150}
                  level="H"
                />
                <p className="mt-2 text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded inline-block">
                  ID: {user.id}
                </p>
                <button
                  onClick={downloadQR}
                  className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors font-medium text-sm w-full"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </>
            ) : (
              <div className="w-[150px] h-[150px] bg-secondary flex items-center justify-center text-sm text-muted-foreground italic rounded">No Token Found</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart type="pie" title="Attendance Breakdown" data={data.statusData} />
      </div>

      {/* Activity & Schedule Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={data.recentActivities} title="Recent Attendance" />
        <UpcomingClasses classes={data.upcomingClasses} title="Today's Schedule" />
      </div>
    </div>
  );
};
