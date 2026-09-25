'use client';

import * as React from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { X, Camera, Flashlight, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CameraQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
  title?: string;
  instruction?: string;
}

// Play pleasant short beep using Web Audio API
function playScanBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore audio failure
  }
}

export function CameraQrScannerModal({
  isOpen,
  onClose,
  onScan,
  title = 'Pemindai Kamera HP',
  instruction = 'Arahkan kamera ke QR Code Kartu Anggota atau Stiker Punggung Buku',
}: CameraQrScannerModalProps) {
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isStarting, setIsStarting] = React.useState(true);
  const [cameras, setCameras] = React.useState<Array<{ id: string; label: string }>>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = React.useState(0);
  const [torchOn, setTorchOn] = React.useState(false);
  const [hasTorch, setHasTorch] = React.useState(false);
  const [scannedSuccess, setScannedSuccess] = React.useState(false);

  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const readerElementId = 'perpusjal-qr-reader';

  // Stop scanner instance cleanly
  const stopScanner = React.useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        scannerRef.current = null;
      }
    }
  }, []);

  // Handle successful scan
  const handleSuccess = React.useCallback(
    async (decodedText: string) => {
      // Audio beep feedback
      playScanBeep();

      // Haptic feedback if supported on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 60, 40]);
        } catch {
          // ignore
        }
      }

      setScannedSuccess(true);

      // Stop scanning before executing callback
      await stopScanner();

      setTimeout(() => {
        onScan(decodedText);
        onClose();
      }, 350);
    },
    [onScan, onClose, stopScanner]
  );

  // Initialize and start camera
  React.useEffect(() => {
    let mounted = true;

    if (!isOpen) {
      stopScanner();
      setScannedSuccess(false);
      setErrorMsg(null);
      return;
    }

    setIsStarting(true);
    setErrorMsg(null);
    setScannedSuccess(false);

    async function initScanner() {
      try {
        // 1. Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (!mounted) return;

        if (!devices || devices.length === 0) {
          setErrorMsg('Tidak ditemukan kamera aktif pada perangkat ini.');
          setIsStarting(false);
          return;
        }

        setCameras(devices);

        // Prefer back camera (environment)
        let preferredIndex = 0;
        const backIndex = devices.findIndex((d) =>
          d.label.toLowerCase().includes('back') ||
          d.label.toLowerCase().includes('belakang') ||
          d.label.toLowerCase().includes('rear') ||
          d.label.toLowerCase().includes('environment')
        );
        if (backIndex !== -1) {
          preferredIndex = backIndex;
        }
        setCurrentCameraIndex(preferredIndex);

        // 2. Create Html5Qrcode instance
        const html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;

        const config: Html5QrcodeCameraScanConfig = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        const cameraId = devices[preferredIndex].id;

        await html5QrCode.start(
          cameraId,
          config,
          (decodedText) => {
            if (mounted) {
              handleSuccess(decodedText);
            }
          },
          () => {
            // Frame scan failure (continuous polling, ignored)
          }
        );

        if (!mounted) return;
        setIsStarting(false);

        // Check if torch/flashlight is supported
        try {
          const capabilities = html5QrCode.getRunningTrackCapabilities() as any;
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        } catch {
          setHasTorch(false);
        }
      } catch (err: any) {
        if (!mounted) return;
        setIsStarting(false);
        console.error('Camera QR start error:', err);
        if (err?.name === 'NotAllowedError' || err?.toString().includes('Permission denied')) {
          setErrorMsg(
            'Izin akses kamera ditolak. Silakan izinkan akses kamera di pengaturan peramban/browser ponsel Anda untuk memindai kode.'
          );
        } else {
          setErrorMsg('Gagal memulai kamera: ' + (err?.message || 'Pastikan kamera tidak sedang dipakai oleh aplikasi lain.'));
        }
      }
    }

    // Delay start slightly to allow DOM container to render
    const timer = setTimeout(() => {
      initScanner();
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, handleSuccess, stopScanner]);

  // Switch camera action
  const handleSwitchCamera = async () => {
    if (cameras.length <= 1 || !scannerRef.current) return;

    try {
      setIsStarting(true);
      await stopScanner();

      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      const config: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        cameras[nextIndex].id,
        config,
        (decodedText) => handleSuccess(decodedText),
        () => {}
      );

      setIsStarting(false);
      setTorchOn(false);
      try {
        const capabilities = html5QrCode.getRunningTrackCapabilities() as any;
        setHasTorch(!!capabilities?.torch);
      } catch {
        setHasTorch(false);
      }
    } catch (err: any) {
      setIsStarting(false);
      setErrorMsg('Gagal beralih kamera: ' + (err?.message || ''));
    }
  };

  // Toggle Torch/Flashlight action
  const handleToggleTorch = async () => {
    if (!scannerRef.current) return;
    try {
      const nextTorch = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
    } catch {
      // Not supported
    }
  };

  const handleCloseModal = async () => {
    await stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-surface border-2 border-foreground max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b-2 border-foreground flex items-center justify-between bg-surface-muted">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-foreground" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1 hover:bg-surface border border-transparent hover:border-foreground transition-colors text-foreground"
            aria-label="Tutup Pemindai"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-black flex-1 min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          {/* Target Html5Qrcode video holder */}
          <div
            id={readerElementId}
            className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
          />

          {/* Stark Gazette Reticle Overlay */}
          {!errorMsg && !scannedSuccess && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-64 border border-white/20">
                {/* 4 Sharp Reticle Corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white" />

                {/* Animated Laser Scanning Line */}
                <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          {/* Starting State */}
          {isStarting && !errorMsg && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-4 text-center z-10 font-mono text-xs text-white">
              <RefreshCw className="w-6 h-6 animate-spin text-white" />
              <span>MEMBUKA KAMERA PONSEL...</span>
              <span className="text-[10px] text-white/70">Pastikan izin kamera aktif pada peramban.</span>
            </div>
          )}

          {/* Success Flash */}
          {scannedSuccess && (
            <div className="absolute inset-0 bg-emerald-950/80 flex flex-col items-center justify-center gap-2 p-4 text-center z-10 font-mono text-white animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <span className="font-bold text-sm tracking-wider uppercase">KODE BERHASIL TERDETEKSI!</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="absolute inset-0 bg-background/95 p-6 flex flex-col items-center justify-center text-center space-y-3 font-mono text-xs z-10 text-foreground">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <p className="font-sans text-xs text-muted max-w-xs">{errorMsg}</p>
              <button
                type="button"
                onClick={handleCloseModal}
                className="mt-2 px-4 py-2 border border-foreground bg-foreground text-background font-mono text-xs uppercase font-bold hover:bg-foreground/90 transition-colors"
              >
                Tutup & Ketik Manual
              </button>
            </div>
          )}
        </div>

        {/* Footer Controls & Instructions */}
        <div className="p-4 border-t-2 border-foreground bg-surface space-y-3 font-mono text-xs">
          <p className="font-sans text-xs text-center text-muted">
            {instruction}
          </p>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border-hairline">
            <div className="flex items-center gap-2">
              {cameras.length > 1 && (
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  disabled={isStarting}
                  className="px-3 py-1.5 border border-border-hairline hover:border-foreground bg-surface-muted transition-colors inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider"
                  title="Ganti Lensa Kamera"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Kamera ({currentCameraIndex + 1}/{cameras.length})</span>
                </button>
              )}

              {hasTorch && (
                <button
                  type="button"
                  onClick={handleToggleTorch}
                  className={`px-3 py-1.5 border transition-colors inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider ${
                    torchOn
                      ? 'border-amber-500 bg-amber-500 text-black font-bold'
                      : 'border-border-hairline hover:border-foreground bg-surface-muted text-foreground'
                  }`}
                  title="Lampu Kilat / Senter"
                >
                  <Flashlight className="w-3 h-3" />
                  <span>{torchOn ? 'Senter ON' : 'Senter'}</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-1.5 bg-foreground text-background font-mono text-xs uppercase font-bold hover:bg-foreground/90 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
