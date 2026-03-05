import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, User } from 'lucide-react';

interface ClassItem {
  id: string;
  subject: string;
  time: string;
  room: string;
  instructor?: string;
  isNow?: boolean;
}

interface UpcomingClassesProps {
  classes: ClassItem[];
  title?: string;
}

export const UpcomingClasses: React.FC<UpcomingClassesProps> = ({
  classes,
  title = 'Upcoming Classes',
}) => {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className={`
                relative p-4 rounded-xl border transition-all duration-200
                ${classItem.isNow 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-border hover:border-primary/30 hover:bg-secondary/30'
                }
              `}
            >
              {classItem.isNow && (
                <span className="absolute -top-2 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Now
                </span>
              )}
              <h4 className="font-semibold text-foreground mb-2">{classItem.subject}</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{classItem.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{classItem.room}</span>
                </div>
                {classItem.instructor && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{classItem.instructor}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
