import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { AttendanceChart } from '@/components/AttendanceChart';

export const AttendanceLayout: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<any[]>([]);

    const summaryData = React.useMemo(() => {
        if (!records || records.length === 0) return [];
        const counts: Record<string, number> = {};
        records.forEach((r: any) => {
            const key = (r.type || 'unknown').toLowerCase();
            counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: value as number,
        }));
    }, [records]);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        fetchApi(`/dashboard/student/${user.id}`)
            .then((res) => {
                setRecords(res.recentActivities || []);
                setLoading(false);
            })
            .catch((err: any) => {
                setError(err.message || 'Failed to load attendance records.');
                setLoading(false);
            });
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Attendance Records</h1>
            <p className="text-muted-foreground">View detailed records of your classes.</p>

            {loading && (
                <div className="text-sm text-muted-foreground">Loading attendance records...</div>
            )}

            {error && !loading && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            {!loading && !error && summaryData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AttendanceChart type="pie" title="Attendance Summary" data={summaryData} />
                </div>
            )}

            {!loading && !error && (
            <Card className="shadow-sm border border-border/60 rounded-2xl bg-card/80 backdrop-blur-sm transition-shadow duration-200 hover:shadow-xl">
                    <CardHeader className="flex items-center justify-between pb-3 border-b border-border/70">
                        <CardTitle className="text-lg font-semibold tracking-tight">Recent Attendance</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {records.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No attendance records found.</p>
                        ) : (
                            <Table className="w-full text-sm">
                                <TableHeader>
                                    <TableRow className="bg-muted/70">
                                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                                            Time
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                                            Subject
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((r) => (
                                        <TableRow
                                            key={r.id}
                                            className="hover:bg-muted/60 transition-colors"
                                        >
                                            <TableCell className="py-3">{r.date}</TableCell>
                                            <TableCell className="py-3">{r.time}</TableCell>
                                            <TableCell className="py-3">{r.subject}</TableCell>
                                            <TableCell className="py-3 capitalize font-medium">
                                                {r.type}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AttendanceLayout;
