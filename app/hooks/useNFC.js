'use client';

import { useState, useEffect, useCallback } from 'react';

export const useNFC = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [lastScan, setLastScan] = useState(null);
    const [scanHistory, setScanHistory] = useState([]);

    // Check NFC support on component mount
    useEffect(() => {
        if ('NDEFReader' in window) {
            setIsSupported(true);
        } else {
            setIsSupported(false);
            setError('NFC is not supported on this device/browser');
        }
    }, []);

    // Start NFC scanning
    const startScan = useCallback(async () => {
        if (!isSupported) {
            setError('NFC is not supported');
            return;
        }

        try {
            setError(null);
            setIsScanning(true);

            const ndef = new NDEFReader();

            // Request permission to use NFC
            await ndef.scan();

            console.log('NFC scan started successfully');

            // Listen for NFC tags
            ndef.addEventListener('reading', ({ message, serialNumber }) => {
                console.log('NFC tag detected:', { message, serialNumber });

                const scanData = {
                    id: Date.now(),
                    serialNumber,
                    timestamp: new Date().toISOString(),
                    records: []
                };

                // Process NDEF records
                for (const record of message.records) {
                    const recordData = {
                        recordType: record.recordType,
                        mediaType: record.mediaType,
                        id: record.id,
                        data: null
                    };

                    // Decode record data based on type
                    if (record.recordType === 'text') {
                        const textDecoder = new TextDecoder(record.encoding || 'utf-8');
                        recordData.data = textDecoder.decode(record.data);
                    } else if (record.recordType === 'url') {
                        const textDecoder = new TextDecoder();
                        recordData.data = textDecoder.decode(record.data);
                    } else {
                        // For other types, convert to hex string
                        recordData.data = Array.from(new Uint8Array(record.data))
                            .map(b => b.toString(16).padStart(2, '0'))
                            .join('');
                    }

                    scanData.records.push(recordData);
                }

                setLastScan(scanData);
                setScanHistory(prev => [scanData, ...prev.slice(0, 9)]); // Keep last 10 scans
            });

            ndef.addEventListener('readingerror', () => {
                console.error('Error reading NFC tag');
                setError('Error reading NFC tag');
                setIsScanning(false);
            });

        } catch (error) {
            console.error('NFC scan error:', error);
            setError(error.message || 'Failed to start NFC scan');
            setIsScanning(false);
        }
    }, [isSupported]);

    // Stop NFC scanning
    const stopScan = useCallback(() => {
        setIsScanning(false);
        // Note: There's no direct way to stop NDEFReader scanning
        // The scan will continue until the page is refreshed or closed
        console.log('NFC scan stopped');
    }, []);

    // Write to NFC tag
    const writeToTag = useCallback(async (data) => {
        if (!isSupported) {
            setError('NFC is not supported');
            return false;
        }

        try {
            setError(null);
            const ndef = new NDEFReader();

            await ndef.write({
                records: [{ recordType: "text", data }]
            });

            console.log('Successfully wrote to NFC tag');
            return true;
        } catch (error) {
            console.error('NFC write error:', error);
            setError(error.message || 'Failed to write to NFC tag');
            return false;
        }
    }, [isSupported]);

    // Clear scan history
    const clearHistory = useCallback(() => {
        setScanHistory([]);
        setLastScan(null);
    }, []);

    return {
        isSupported,
        isScanning,
        error,
        lastScan,
        scanHistory,
        startScan,
        stopScan,
        writeToTag,
        clearHistory
    };
};
