import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const StudentsLayout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const initialClassId = useMemo(() => {
        const state = location.state as any;
        const id = state?.classId;
        if (id == null) return '';
        return String(id);
    }, [location.state]);

    const [selectedSessionId, setSelectedSessionId] = useState<string>(initialClassId);
    const [sessions, setSessions] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If opened from My Classes (state contains classId) we can skip loading sessions.
        if (!user || user.role !== 'faculty') return;
        if (selectedSessionId) return;

        setLoadingSessions(true);
        setError(null);
        fetchApi(`/dashboard/faculty/${user.id}`)
            .then((res) => {
                setSessions(res.todayClasses || []);
            })
            .catch((err: any) => {
                setError(err.message || 'Failed to load classes.');
            })
            .finally(() => setLoadingSessions(false));
    }, [user, selectedSessionId]);

    useEffect(() => {
        if (!selectedSessionId) {
            setStudents([]);
            return;
        }

        setLoadingStudents(true);
        setError(null);
        fetchApi(`/dashboard/session/${selectedSessionId}/students`)
            .then((res) => {
                setStudents(res || []);
            })
            .catch((err: any) => {
                setError(err.message || 'Failed to load students.');
            })
            .finally(() => setLoadingStudents(false));
    }, [selectedSessionId]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">My Students</h1>
            <p className="text-muted-foreground">Manage and view the students enrolled in your classes.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border border-border/60 rounded-2xl bg-card/80 shadow-sm hover:shadow-xl transition-all duration-200">
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">Student Overview</CardTitle>
                                <CardDescription>
                                    Quickly access your enrolled students from your class and attendance views.
                                </CardDescription>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="hidden md:inline-flex items-center gap-2"
                            onClick={() => navigate('/dashboard/classes')}
                        >
                            <Search className="w-4 h-4" />
                            Browse Classes
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {error && (
                            <div className="mb-4 text-sm text-destructive">{error}</div>
                        )}

                        {!selectedSessionId && user?.role === 'faculty' && (
                            <div className="space-y-3">
                                <div className="rounded-xl border border-dashed border-border/70 bg-muted/40 px-6 py-6">
                                    <p className="text-sm text-muted-foreground">
                                        Select a class session to view the enrolled students.
                                    </p>
                                </div>
                                {loadingSessions && (
                                    <div className="text-sm text-muted-foreground">Loading your classes...</div>
                                )}
                                {!loadingSessions && sessions.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {sessions.map((s: any) => (
                                            <button
                                                key={s.id}
                                                type="button"
                                                onClick={() => setSelectedSessionId(String(s.id))}
                                                className="text-left p-4 rounded-xl border border-border/70 bg-card hover:bg-secondary/30 hover:border-primary/40 transition-colors"
                                            >
                                                <p className="font-medium text-foreground">{s.name}</p>
                                                <p className="text-xs text-muted-foreground">{s.time} • {s.students} students</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {!loadingSessions && sessions.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No class sessions found. Open a class from <span className="font-medium">My Classes</span>.
                                    </p>
                                )}
                            </div>
                        )}

                        {!!selectedSessionId && (
                            <div className="rounded-xl border border-border/70 overflow-hidden">
                                {loadingStudents ? (
                                    <div className="p-6 text-sm text-muted-foreground">Loading students...</div>
                                ) : students.length === 0 ? (
                                    <div className="p-6 text-sm text-muted-foreground">No students found for this class.</div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/70">
                                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Name</TableHead>
                                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">Email</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {students.map((s: any) => (
                                                <TableRow key={s.id} className="hover:bg-muted/60 transition-colors">
                                                    <TableCell className="py-3 font-medium">{s.name}</TableCell>
                                                    <TableCell className="py-3 break-all text-muted-foreground">{s.email}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border/60 bg-card/80 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-warning" />
                            Tips
                        </CardTitle>
                        <CardDescription>
                            Use this space to stay on top of students who may need attention.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Review attendance trends from the Reports and Dashboard views.</li>
                            <li>• Coordinate with students who are close to the minimum threshold.</li>
                            <li>• Mark attendance consistently to keep this data accurate.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default StudentsLayout;
