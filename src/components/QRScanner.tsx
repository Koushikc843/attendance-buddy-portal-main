import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { fetchApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QRScannerProps {
    sessionId: string;
    onSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ sessionId, onSuccess, open, onOpenChange }) => {
    const [scanning, setScanning] = useState(false);
    const [controls, setControls] = useState<any>(null);
    const { toast } = useToast();

    const startScanning = async () => {
        try {
            setScanning(true);
            const codeReader = new BrowserQRCodeReader();
            const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();

            const selectedDeviceId = videoInputDevices[0].deviceId;

            const ctrl = await codeReader.decodeFromVideoDevice(selectedDeviceId, 'video', async (result, error) => {
                if (result) {
                    // Found a code
                    ctrl.stop();
                    setScanning(false);
                    setControls(null);
                    handleScan(result.getText());
                }
            });
            setControls(ctrl);
        } catch (err) {
            console.error(err);
            toast({
                title: 'Camera Error',
                description: 'Failed to access camera. Please check permissions.',
                variant: 'destructive'
            });
            setScanning(false);
        }
    };

    const stopScanning = () => {
        if (controls) {
            controls.stop();
            setControls(null);
        }
        setScanning(false);
    };

    const handleScan = async (rawText: string) => {
        try {
            let payload: any = {};
            const normalizedSessionId = (() => {
                const n = Number(sessionId);
                return Number.isFinite(n) ? n : sessionId;
            })();

            try {
                // Prefer JSON payloads from QR codes: { studentId, studentName, email }
                const parsed = JSON.parse(rawText);
                if (parsed && parsed.studentId) {
                    payload = {
                        studentId: parsed.studentId,
                        sessionId: normalizedSessionId,
                    };
                } else {
                    // Fallback to legacy token-based payload
                    payload = { qrToken: rawText, sessionId: normalizedSessionId };
                }
            } catch {
                // Not JSON – treat as legacy token
                payload = { qrToken: rawText, sessionId: normalizedSessionId };
            }

            console.debug('[QRScanner] decoded QR text:', rawText);
            console.debug('[QRScanner] mark attendance payload:', payload);

            const res = await fetchApi('/attendance/mark', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            console.debug('[QRScanner] mark attendance response:', res);
            toast({
                title: 'Success',
                description: (res.message || 'Attendance marked successfully') + (res.data?.studentName ? ` (${res.data.studentName})` : ''),
            });
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('[QRScanner] Failed to mark attendance', err);
            toast({
                title: 'Failed',
                description: err.message || 'Failed to mark attendance',
                variant: 'destructive'
            });
        }
    };

    React.useEffect(() => {
        if (open && !scanning && !controls) {
            startScanning();
        } else if (!open) {
            stopScanning();
        }
        return () => stopScanning();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Student QR Code</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-4 p-4">
                    <div className="w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden relative">
                        <video id="video" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-lg" />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                        Position the student's QR code within the frame to automatically mark attendance.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};
