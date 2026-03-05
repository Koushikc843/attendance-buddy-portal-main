import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const SettingsLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and system options.</p>
      </div>

      {/* Account Settings */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your personal information and credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue={user?.name} placeholder="Your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email} placeholder="you@example.com" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" placeholder="New password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm password" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button">Save Account Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* System Preferences */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
          <CardDescription>Control default thresholds and QR-based attendance behaviour.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="threshold">Default Attendance Threshold (%)</Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                max={100}
                defaultValue={75}
              />
              <p className="text-xs text-muted-foreground">
                Used for highlighting low attendance in dashboards and reports.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="qrToggle">Enable QR Attendance</Label>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">QR-based attendance</p>
                  <p className="text-xs text-muted-foreground">
                    Allow students to mark attendance using their QR code.
                  </p>
                </div>
                <Switch id="qrToggle" defaultChecked />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsLayout;
