'use client';

import { useState, useEffect, useCallback } from 'react';
import { isValidURL } from '../utils/nfc';

export const useNFC = () => {
    const [isSupported, setIsSupported] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [lastScan, setLastScan] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Check NFC support on component mount
    useEffect(() => {
        if ('NDEFReader' in window) {
            setIsSupported(true);
        } else {
            setIsSupported(false);
            setError('NFC is not supported on this device/browser');
        }
    }, []);

    // Function to fetch profile data from Arweave API
    const fetchProfileData = useCallback(async (url) => {
        try {
            setLoadingProfile(true);
            setError(null);

            const apiUrl = `https://arweave.tech/api/etgl/profile?url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setProfileData(data);
            console.log('Profile data received:', data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            setError(`Failed to fetch profile data: ${error.message}`);
            setProfileData(null);
        } finally {
            setLoadingProfile(false);
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
            ndef.addEventListener('reading', async ({ message, serialNumber }) => {
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

                // Check if any record contains a URL and make API call
                for (const record of scanData.records) {
                    if (record.recordType === 'url' || record.recordType === 'absolute-url') {
                        console.log('URL detected in NFC tag:', record.data);
                        await fetchProfileData(record.data);
                        break; // Only process the first URL found
                    } else if (record.recordType === 'text' && isValidURL(record.data)) {
                        console.log('URL detected in text record:', record.data);
                        await fetchProfileData(record.data);
                        break;
                    }
                }
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

    // Clear profile data
    const clearProfile = useCallback(() => {
        setProfileData(null);
        setLastScan(null);
    }, []);

    return {
        isSupported,
        isScanning,
        error,
        lastScan,
        profileData,
        loadingProfile,
        startScan,
        stopScan,
        writeToTag,
        clearProfile
    };
};
