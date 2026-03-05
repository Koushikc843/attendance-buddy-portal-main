import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BarChart3, ClipboardCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ClassesLayout: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                if (user.role === 'student') {
                    const res = await fetchApi(`/dashboard/student/${user.id}`);
                    setClasses(res.upcomingClasses || []);
                } else if (user.role === 'faculty') {
                    const res = await fetchApi(`/dashboard/faculty/${user.id}`);
                    setClasses(res.todayClasses || []);
                } else {
                    setClasses([]);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load classes.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">My Classes</h1>
            <p className="text-muted-foreground">Manage your enrolled courses or teach assignments.</p>

            {loading && (
                <div className="text-sm text-muted-foreground">Loading classes...</div>
            )}

            {error && !loading && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((c: any) => {
                        const className = c.subject || c.name;
                        const courseCode = c.code || c.courseCode || '—';
                        const facultyName = c.instructor || (user?.role === 'faculty' ? user.name : 'TBA');
                        const totalStudents = typeof c.students === 'number' ? c.students : undefined;
                        const attendancePct = c.attendance || c.attendancePercentage;

                        return (
                            <Card key={c.id} className="shadow-sm border-border hover:border-primary/40 transition-all">
                                <CardHeader className="space-y-1">
                                    <CardTitle className="text-lg flex items-center justify-between gap-2">
                                        <span>{className}</span>
                                        {courseCode !== '—' && (
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                {courseCode}
                                            </span>
                                        )}
                                    </CardTitle>
                                    <CardDescription>{c.time}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm text-muted-foreground space-y-1">
                                        {facultyName && (
                                            <p>
                                                <span className="font-medium text-foreground">Faculty:</span> {facultyName}
                                            </p>
                                        )}
                                        {typeof totalStudents === 'number' && (
                                            <p className="flex items-center gap-1">
                                                <Users className="w-4 h-4" /> {totalStudents} students
                                            </p>
                                        )}
                                        {c.room && <p>Room: {c.room}</p>}
                                        {typeof attendancePct === 'number' && (
                                            <p className="flex items-center gap-1">
                                                <BarChart3 className="w-4 h-4" /> Attendance: {attendancePct}%
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 min-w-[120px]"
                                            onClick={() => navigate('/dashboard/students', { state: { classId: c.id } })}
                                        >
                                            View Students
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 min-w-[120px]"
                                            onClick={() =>
                                                navigate('/dashboard/attendance', { state: { classId: c.id } })
                                            }
                                        >
                                            View Attendance
                                        </Button>
                                        {user?.role === 'faculty' && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                className="flex-1 min-w-[140px]"
                                                onClick={() =>
                                                    navigate('/dashboard/mark-attendance', {
                                                        state: { sessionId: c.id },
                                                    })
                                                }
                                            >
                                                <ClipboardCheck className="w-4 h-4 mr-1" />
                                                Mark Attendance
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                    {classes.length === 0 && (
                        <p className="text-sm text-muted-foreground">No classes found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassesLayout;
