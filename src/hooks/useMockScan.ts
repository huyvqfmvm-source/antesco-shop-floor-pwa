import { useState, useCallback, useRef } from 'react';
import { useApp } from '@/store/AppContext';
import { MOCK_SCAN_SAMPLE_CODES } from '@/mocks/scan-logs';

export type ScanCodeType = 'PO' | 'HU' | 'Batch' | 'Bin' | 'OD' | 'ST' | 'Container' | 'Seal' | 'TruckPlate' | 'WeighSlip' | 'Device';

export type ScanResult = 'success' | 'duplicate' | 'wrong_type' | 'wrong_code';

export interface ScanEvent {
  id: string;
  timestamp: string;
  codeType: ScanCodeType;
  codeValue: string;
  result: ScanResult;
  message: string;
}

interface UseMockScanOptions {
  allowedTypes: ScanCodeType[];
  screen: string;
  onSuccess?: (code: ScanEvent) => void;
  onError?: (code: ScanEvent) => void;
}

export function useMockScan({ allowedTypes, screen, onSuccess, onError }: UseMockScanOptions) {
  const { state, addToast, addActivityLog } = useApp();
  const [lastScan, setLastScan] = useState<ScanEvent | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const scanCounterRef = useRef(0);

  const resetLastScan = useCallback(() => {
    setLastScan(null);
  }, []);

  const processScan = useCallback((codeValue: string): ScanEvent => {
    scanCounterRef.current += 1;

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    // Check duplicate
    if (scannedCodes.includes(codeValue)) {
      const evt: ScanEvent = {
        id: `scan-${scanCounterRef.current}`,
        timestamp,
        codeType: 'HU',
        codeValue,
        result: 'duplicate',
        message: `Trùng mã — "${codeValue}" đã được quét trước đó`,
      };
      setLastScan(evt);
      addToast('warning', evt.message);
      onError?.(evt);
      return evt;
    }

    // Determine code type based on format
    let detectedType: ScanCodeType = 'HU';
    if (codeValue.match(/^10\d{6}$/)) {
      detectedType = 'PO';
    } else if (codeValue.match(/^PO-\d{4}-\d{5}$/)) {
      detectedType = 'PO';
    } else if (codeValue.match(/^HU-\d{4}-(MA|BK)-/)) {
      detectedType = 'HU';
    } else if (codeValue.match(/^002\d{6}$/) || codeValue.match(/^(RM|FG)-\d{4}-/)) {
      detectedType = 'Batch';
    } else if (codeValue.match(/^(KL|KM|NL|BB|HC)-\d{2}-/)) {
      detectedType = 'Bin';
    } else if (codeValue.match(/^OD-\d{4}-\d{4}$/)) {
      detectedType = 'OD';
    } else if (codeValue.match(/^ST-\d{4}-\d{4}$/)) {
      detectedType = 'ST';
    } else if (codeValue.match(/^[A-Z]{4}\d{7}$/)) {
      detectedType = 'Container';
    } else if (codeValue.match(/^SEAL-\d{6}$/)) {
      detectedType = 'Seal';
    } else if (codeValue.match(/^\d{2,3}[A-Z]-\d{3}\.\d{2,3}$/)) {
      detectedType = 'TruckPlate';
    } else if (codeValue.match(/^WS-\d{4}-\d{5}$/)) {
      detectedType = 'WeighSlip';
    }

    // Check if type is allowed
    if (!allowedTypes.includes(detectedType)) {
      const evt: ScanEvent = {
        id: `scan-${scanCounterRef.current}`,
        timestamp,
        codeType: detectedType,
        codeValue,
        result: 'wrong_type',
        message: `Sai loại mã — Đây là mã ${detectedType}, cần quét ${allowedTypes.join('/')}`,
      };
      setLastScan(evt);
      addToast('error', evt.message);
      onError?.(evt);
      return evt;
    }

    // Success
    const evt: ScanEvent = {
      id: `scan-${scanCounterRef.current}`,
      timestamp,
      codeType: detectedType,
      codeValue,
      result: 'success',
      message: `Quét thành công — ${detectedType} "${codeValue}"`,
    };

    setScannedCodes((prev) => [...prev, codeValue]);
    setLastScan(evt);
    setManualCode('');
    setShowManualInput(false);

    // Play sound & vibrate
    if (state.soundEnabled) {
      try {
        const audioCtx = new AudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch { /* audio not supported */ }
    }

    if (state.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Log activity
    addActivityLog(
      state.currentUser,
      state.role?.name || '',
      `Quét ${detectedType}`,
      `${detectedType} "${codeValue}" → ${evt.result} · Màn hình: ${screen}`,
    );

    onSuccess?.(evt);
    return evt;
  }, [scannedCodes, allowedTypes, state, screen, addToast, addActivityLog, onSuccess, onError]);

  const handleManualSubmit = useCallback(() => {
    if (!manualCode.trim()) {
      addToast('error', 'Vui lòng nhập mã để quét');
      return;
    }
    return processScan(manualCode.trim());
  }, [manualCode, processScan, addToast]);

  const handleMockScan = useCallback((codeValue?: string) => {
    const code = codeValue || (allowedTypes.length > 0
      ? MOCK_SCAN_SAMPLE_CODES[allowedTypes[0]]?.[Math.floor(Math.random() * (MOCK_SCAN_SAMPLE_CODES[allowedTypes[0]]?.length || 1))]
      : '10000456');

    if (!code) {
      addToast('error', 'Không có mã mẫu cho loại này');
      return null;
    }

    return processScan(code);
  }, [allowedTypes, processScan, addToast]);

  const clearScannedCodes = useCallback(() => {
    setScannedCodes([]);
    setLastScan(null);
  }, []);

  return {
    lastScan,
    manualCode,
    showManualInput,
    scannedCodes,
    setManualCode,
    setShowManualInput,
    handleMockScan,
    handleManualSubmit,
    processScan,
    resetLastScan,
    clearScannedCodes,
  };
}