import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

export const AttendanceLayout: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [records, setRecords] = useState<any[]>([]);

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

            {!loading && !error && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {records.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No attendance records found.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {records.map((r) => (
                                        <TableRow key={r.id}>
                                            <TableCell>{r.date}</TableCell>
                                            <TableCell>{r.time}</TableCell>
                                            <TableCell>{r.subject}</TableCell>
                                            <TableCell className="capitalize">{r.type}</TableCell>
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
