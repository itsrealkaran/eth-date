'use client';

import { useState } from 'react';
import { useNFC } from '../hooks/useNFC';

export default function NFCScanner() {
    const {
        isSupported,
        isScanning,
        error,
        lastScan,
        scanHistory,
        startScan,
        stopScan,
        writeToTag,
        clearHistory
    } = useNFC();

    const [writeText, setWriteText] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    const handleWrite = async () => {
        if (!writeText.trim()) return;

        const success = await writeToTag(writeText);
        if (success) {
            setWriteText('');
            alert('Successfully wrote to NFC tag!');
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const renderRecord = (record, index) => (
        <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
            <div className="text-sm font-medium text-gray-700">
                Type: {record.recordType}
            </div>
            {record.mediaType && (
                <div className="text-sm text-gray-600">
                    Media Type: {record.mediaType}
                </div>
            )}
            <div className="text-sm text-gray-800 mt-1 break-all">
                Data: {record.data}
            </div>
        </div>
    );

    if (!isSupported) {
        return (
            <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-xl font-bold text-red-800 mb-2">NFC Not Supported</h2>
                <p className="text-red-700">
                    Your device or browser doesn't support NFC functionality.
                    Please use a compatible device with Chrome or Edge browser.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">NFC Scanner</h1>
                <p className="text-gray-600">Scan and interact with NFC tags</p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-800 font-medium">Error</div>
                    <div className="text-red-700">{error}</div>
                </div>
            )}

            {/* Scan Controls */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Scan NFC Tags</h2>

                <div className="flex gap-3 mb-4">
                    <button
                        onClick={startScan}
                        disabled={isScanning}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${isScanning
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isScanning ? 'Scanning...' : 'Start Scan'}
                    </button>

                    <button
                        onClick={stopScan}
                        disabled={!isScanning}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors ${!isScanning
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                    >
                        Stop Scan
                    </button>
                </div>

                {isScanning && (
                    <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Ready to scan NFC tags...</span>
                    </div>
                )}
            </div>

            {/* Write to NFC */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Write to NFC Tag</h2>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={writeText}
                        onChange={(e) => setWriteText(e.target.value)}
                        placeholder="Enter text to write to NFC tag"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleWrite}
                        disabled={!writeText.trim()}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${!writeText.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        Write
                    </button>
                </div>
            </div>

            {/* Last Scan Result */}
            {lastScan && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Last Scan Result</h2>

                    <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                            Serial Number: {lastScan.serialNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                            Scanned: {formatTimestamp(lastScan.timestamp)}
                        </div>

                        <div>
                            <h3 className="font-medium text-gray-800 mb-2">Records:</h3>
                            {lastScan.records.length > 0 ? (
                                lastScan.records.map((record, index) => renderRecord(record, index))
                            ) : (
                                <p className="text-gray-500">No records found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Scan History */}
            {scanHistory.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Scan History</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowHistory(!showHistory)}
                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                {showHistory ? 'Hide' : 'Show'} ({scanHistory.length})
                            </button>
                            <button
                                onClick={clearHistory}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {showHistory && (
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {scanHistory.map((scan) => (
                                <div key={scan.id} className="border border-gray-100 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-2">
                                        {formatTimestamp(scan.timestamp)} - {scan.serialNumber}
                                    </div>
                                    {scan.records.map((record, index) => renderRecord(record, index))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
