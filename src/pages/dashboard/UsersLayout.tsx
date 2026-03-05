import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

export const UsersLayout: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetchApi('/dashboard/admin');
                setStudents(res.students || []);
                setFaculty(res.faculty || []);
                setAdmins(res.admin || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const renderTable = (rows: any[], label: string) => (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                {rows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No {label.toLowerCase()} found.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((u) => (
                                <TableRow key={u.id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell className="break-all">{u.email}</TableCell>
                                    <TableCell>{u.department || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
            <p className="text-muted-foreground">Approve, reject, or delete user registrations.</p>

            {loading && (
                <div className="text-sm text-muted-foreground">Loading users...</div>
            )}

            {error && !loading && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            {!loading && !error && (
                <div className="space-y-6">
                    {renderTable(students, `Students (${students.length})`)}
                    {renderTable(faculty, `Faculty (${faculty.length})`)}
                    {renderTable(admins, `Administrators (${admins.length})`)}
                </div>
            )}
        </div>
    );
};

export default UsersLayout;
