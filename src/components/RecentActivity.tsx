import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'present' | 'absent' | 'late' | 'excused';
  subject: string;
  time: string;
  date: string;
}

interface RecentActivityProps {
  activities: Activity[];
  title?: string;
}

const statusConfig = {
  present: {
    icon: CheckCircle,
    label: 'Present',
    className: 'text-success bg-success/10',
  },
  absent: {
    icon: XCircle,
    label: 'Absent',
    className: 'text-destructive bg-destructive/10',
  },
  late: {
    icon: Clock,
    label: 'Late',
    className: 'text-warning bg-warning/10',
  },
  excused: {
    icon: AlertCircle,
    label: 'Excused',
    className: 'text-accent bg-accent/10',
  },
};

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  title = 'Recent Activity',
}) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = statusConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className={cn('p-2 rounded-lg', config.className)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{activity.subject}</p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                <div className="text-right">
                  <span className={cn('text-sm font-medium px-2 py-1 rounded-full', config.className)}>
                    {config.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
