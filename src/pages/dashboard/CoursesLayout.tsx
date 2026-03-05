import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';

export const CoursesLayout: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetchApi('/courses');
                setCourses(res || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load courses.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground">Manage college courses.</p>

            {loading && (
                <div className="text-sm text-muted-foreground">Loading courses...</div>
            )}

            {error && !loading && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            {!loading && !error && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Available Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {courses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No courses found.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Faculty</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.code}</TableCell>
                                            <TableCell>{c.name}</TableCell>
                                            <TableCell>{c.faculty?.name || '-'}</TableCell>
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

export default CoursesLayout;
