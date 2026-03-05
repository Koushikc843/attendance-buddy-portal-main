import React, { useEffect, useMemo, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DepartmentSummary {
    name: string;
    studentCount: number;
    facultyCount: number;
}

export const DepartmentsLayout: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [faculty, setFaculty] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetchApi('/dashboard/admin');
                setStudents(res.students || []);
                setFaculty(res.faculty || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load departments.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const departments: DepartmentSummary[] = useMemo(() => {
        const map = new Map<string, DepartmentSummary>();
        const ensure = (name: string) => {
            const key = name || 'Unassigned';
            if (!map.has(key)) {
                map.set(key, { name: key, studentCount: 0, facultyCount: 0 });
            }
            return map.get(key)!;
        };
        students.forEach((s) => {
            ensure(s.department).studentCount += 1;
        });
        faculty.forEach((f) => {
            ensure(f.department).facultyCount += 1;
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [students, faculty]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Departments</h1>
            <p className="text-muted-foreground">Manage college departments.</p>

            {loading && (
                <div className="text-sm text-muted-foreground">Loading departments...</div>
            )}

            {error && !loading && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((d) => (
                        <Card key={d.name} className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">{d.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-1">
                                <p>Students: {d.studentCount}</p>
                                <p>Faculty: {d.facultyCount}</p>
                            </CardContent>
                        </Card>
                    ))}
                    {departments.length === 0 && (
                        <p className="text-sm text-muted-foreground">No departments found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DepartmentsLayout;
