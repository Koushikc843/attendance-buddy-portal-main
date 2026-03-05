import React, { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import { TrendingUp, Users, Calendar, Clock } from 'lucide-react';

export const ReportsLayout: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetchApi('/dashboard/admin');
                setData(res);
            } catch (err: any) {
                setError(err.message || 'Failed to load reports.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">System Reports</h1>
            <p className="text-muted-foreground">Generate and view attendance reports.</p>

            {loading && (
                <div className="text-sm text-muted-foreground">Loading report summary...</div>
            )}

            {error && !loading && (
                <div className="text-sm text-destructive">{error}</div>
            )}

            {!loading && !error && data && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Users"
                        value={data.totalUsers}
                        subtitle="All roles combined"
                        icon={Users}
                        variant="primary"
                    />
                    <StatCard
                        title="Overall Attendance"
                        value={`${data.overallAttendanceRate}%`}
                        subtitle="Across all departments"
                        icon={TrendingUp}
                        variant="success"
                    />
                    <StatCard
                        title="Active Sessions Today"
                        value={data.activeSessionsToday}
                        subtitle="Classes in progress"
                        icon={Calendar}
                        variant="accent"
                    />
                    <StatCard
                        title="Pending Approvals"
                        value={data.pendingApprovals}
                        subtitle="Items requiring attention"
                        icon={Clock}
                        variant="warning"
                    />
                </div>
            )}
        </div>
    );
};

export default ReportsLayout;
