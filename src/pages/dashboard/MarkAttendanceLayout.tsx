import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRScanner } from '@/components/QRScanner';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export const MarkAttendanceLayout: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceList, setAttendanceList] = useState<Map<number, string>>(new Map());
    const [scannerOpen, setScannerOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchApi(`/dashboard/faculty/${user.id}`)
                .then(res => {
                    setSessions(res.todayClasses || []);
                });
        }
    }, [user]);

    useEffect(() => {
        if (selectedSessionId) {
            fetchApi(`/dashboard/session/${selectedSessionId}/students`)
                .then(res => {
                    setStudents(res);
                    const initMap = new Map();
                    res.forEach((s: any) => initMap.set(s.id, 'Present'));
                    setAttendanceList(initMap);
                });
        }
    }, [selectedSessionId]);

    const handleCheckboxChange = (studentId: number, checked: boolean) => {
        setAttendanceList(prev => {
            const next = new Map(prev);
            next.set(studentId, checked ? 'Present' : 'Absent');
            return next;
        });
    };

    const submitManualAttendance = async () => {
        if (!selectedSessionId) return;

        const payload = {
            sessionId: Number(selectedSessionId),
            attendanceList: Array.from(attendanceList.entries()).map(([studentId, status]) => ({
                studentId,
                status
            }))
        };

        try {
            const res = await fetchApi('/attendance/manual', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            toast({ title: 'Success', description: res.message || 'Attendance saved successfully.' });
            setSessions(sessions.filter(s => s.id !== selectedSessionId));
            setSelectedSessionId('');
        } catch (err: any) {
            toast({ title: 'Error', description: err.message || 'Failed to submit', variant: 'destructive' });
        }
    };

    if (!user) return null;

    if (sessions.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
                <p className="text-muted-foreground">You have no pending classes to mark attendance for right now.</p>
            </div>
        );
    }

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>

            {!selectedSessionId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(s => (
                        <Card
                            key={s.id}
                            className="cursor-pointer rounded-2xl border border-border/70 bg-card/80 shadow-sm hover:shadow-xl hover:border-primary/60 hover:-translate-y-1 transition-transform transition-shadow duration-200"
                            onClick={() => setSelectedSessionId(s.id)}
                        >
                            <CardHeader>
                                <CardTitle>{s.name}</CardTitle>
                                <CardDescription>{s.time} • {s.students} Students</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full">Select Session</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between bg-card p-6 rounded-xl border border-border shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{selectedSession?.name}</h2>
                            <p className="text-muted-foreground">{selectedSession?.time}</p>
                        </div>
                        <Button variant="outline" onClick={() => setSelectedSessionId('')}>Change Session</Button>
                    </div>

                    <Tabs defaultValue="manual" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="manual">Manual Roll Call</TabsTrigger>
                            <TabsTrigger value="qr">Scan QR Code</TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual" className="p-6 bg-card border border-border rounded-xl mt-4 shadow-sm space-y-6">
                            <h3 className="font-semibold text-lg text-foreground">Student List</h3>
                            <div className="space-y-4">
                                {students.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 p-3 bg-secondary/30 rounded-lg border border-border/50">
                                        <Checkbox
                                            id={`student-${student.id}`}
                                            checked={attendanceList.get(student.id) === 'Present'}
                                            onCheckedChange={(checked) => handleCheckboxChange(student.id, checked as boolean)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor={`student-${student.id}`} className="font-medium cursor-pointer">
                                                {student.name}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {student.email}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {students.length === 0 && <p className="text-muted-foreground text-sm">No students found.</p>}
                            </div>
                            {students.length > 0 && (
                                <Button className="w-full" onClick={submitManualAttendance}>Submit Attendance</Button>
                            )}
                        </TabsContent>

                        <TabsContent value="qr" className="p-6 bg-card border border-border rounded-xl mt-4 shadow-sm flex flex-col items-center justify-center py-12">
                            <h3 className="font-semibold text-lg text-foreground mb-2">QR Code Scanner</h3>
                            <p className="text-muted-foreground text-center max-w-md mb-6">
                                Click the button below to open your device camera and scan student QR codes one by one.
                            </p>
                            <Button size="lg" onClick={() => setScannerOpen(true)}>Open Camera Scanner</Button>
                        </TabsContent>
                    </Tabs>

                    <QRScanner
                        open={scannerOpen}
                        onOpenChange={setScannerOpen}
                        sessionId={selectedSessionId}
                        onSuccess={() => { }}
                    />
                </div>
            )}
        </div>
    );
};

export default MarkAttendanceLayout;
