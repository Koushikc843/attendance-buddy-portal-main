import React from 'react';

export const StudentsLayout: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">My Students</h1>
            <p className="text-muted-foreground">Manage and view the students enrolled in your classes.</p>
        </div>
    );
};

export default StudentsLayout;
