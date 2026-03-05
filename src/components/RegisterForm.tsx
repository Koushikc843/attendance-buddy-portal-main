import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Loader2, Mail, Lock, AlertCircle, Building, BookOpen, Fingerprint } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const roleConfig = {
    student: {
        icon: GraduationCap,
        title: 'Student',
        description: 'Register as a Student',
        color: 'bg-primary'
    },
    faculty: {
        icon: Users,
        title: 'Faculty',
        description: 'Register as Faculty',
        color: 'bg-accent'
    }
};

interface RegisterFormProps {
    onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Student specific
    const [usn, setUsn] = useState('');
    const [department, setDepartment] = useState('');
    const [year, setYear] = useState('');

    // Faculty specific
    const [facultyId, setFacultyId] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (selectedRole === 'student') {
                await fetchApi('/auth/register/student', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, role: 'student', usn, department, year: Number(year) })
                });
            } else if (selectedRole === 'faculty') {
                await fetchApi('/auth/register/faculty', {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, role: 'faculty', facultyId, department })
                });
            }

            toast({
                title: 'Registration Successful',
                description: 'Your account has been created. Please wait for an Admin to approve your account before logging in.',
            });
            onSwitchToLogin();
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md animate-slide-up">
            <Card className="shadow-card border-0">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                    <CardDescription>Register for the attendance system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Role Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Select Your Role</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                                if (role === 'admin') return null; // Admins cannot self-register
                                const config = roleConfig[role as keyof typeof roleConfig];
                                const Icon = config.icon;
                                const isSelected = selectedRole === role;

                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => {
                                            setSelectedRole(role);
                                            setError(null);
                                        }}
                                        className={`
                      relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                      ${isSelected
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                                            }
                    `}
                                    >
                                        <div className={`
                      p-2 rounded-lg mb-2 transition-colors
                      ${isSelected ? config.color : 'bg-secondary'}
                    `}>
                                            <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                        </div>
                                        <span className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {config.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="user@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {selectedRole === 'student' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="usn">USN / Roll Number</Label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="usn"
                                            type="text"
                                            placeholder="e.g. 1RV20CS120"
                                            value={usn}
                                            onChange={(e) => setUsn(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="department"
                                                type="text"
                                                placeholder="CSE"
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year">Year</Label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="year"
                                                type="number"
                                                min="1"
                                                max="4"
                                                placeholder="1, 2, 3 or 4"
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedRole === 'faculty' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="facultyId">Faculty ID</Label>
                                        <div className="relative">
                                            <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="facultyId"
                                                type="text"
                                                placeholder="FAC-1234"
                                                value={facultyId}
                                                onChange={(e) => setFacultyId(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="fac-department">Department</Label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="fac-department"
                                                type="text"
                                                placeholder="CSE"
                                                value={department}
                                                onChange={(e) => setDepartment(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            variant="gradient"
                            size="lg"
                            className="w-full mt-6"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Registering...
                                </>
                            ) : (
                                `Register as ${(roleConfig as any)[selectedRole].title}`
                            )}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground mt-4">
                            Already have an account?{' '}
                            <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline font-medium">
                                Sign in here
                            </button>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
