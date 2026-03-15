import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import React, { useEffect, useRef, useState } from "react";

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({
  onScan,
  onError,
}: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scannerId] = useState(() => `reader-${Math.random().toString(36).substring(2, 9)}`);

  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  }, [onScan, onError]);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 150 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [
        Html5QrcodeScanType.SCAN_TYPE_CAMERA,
        Html5QrcodeScanType.SCAN_TYPE_FILE,
      ],
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
      ],
    };

    scannerRef.current = new Html5QrcodeScanner(scannerId, config, false);

    scannerRef.current.render(
      (decodedText) => {
        if (scannerRef.current) {
          scannerRef.current.pause(true);
          onScanRef.current(decodedText);
          // Resume after 2 seconds to avoid multiple scans
          setTimeout(() => {
            if (scannerRef.current) {
              scannerRef.current.resume();
            }
          }, 2000);
        }
      },
      (error) => {
        if (onErrorRef.current) onErrorRef.current(error);
      },
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [scannerId]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-sm border border-slate-200">
      <div id={scannerId} className="w-full"></div>
    </div>
  );
}
