// NFC utility functions and constants

export const NFC_RECORD_TYPES = {
    TEXT: 'text',
    URL: 'url',
    MIME: 'mime',
    ABSOLUTE_URL: 'absolute-url',
    EXTERNAL: 'external',
    UNKNOWN: 'unknown',
    EMPTY: 'empty'
};

export const NFC_ERRORS = {
    NOT_SUPPORTED: 'NFC is not supported on this device/browser',
    PERMISSION_DENIED: 'NFC permission was denied',
    NOT_READABLE: 'NFC tag is not readable',
    INVALID_MESSAGE: 'Invalid NFC message format',
    WRITE_FAILED: 'Failed to write to NFC tag',
    SCAN_FAILED: 'Failed to start NFC scan'
};

/**
 * Check if NFC is supported in the current environment
 * @returns {boolean} True if NFC is supported
 */
export const isNFCSupported = () => {
    return 'NDEFReader' in window;
};

/**
 * Format NFC record data for display
 * @param {Object} record - NFC record object
 * @returns {string} Formatted record data
 */
export const formatRecordData = (record) => {
    if (!record || !record.data) return 'No data';

    try {
        switch (record.recordType) {
            case NFC_RECORD_TYPES.TEXT:
                return record.data;

            case NFC_RECORD_TYPES.URL:
            case NFC_RECORD_TYPES.ABSOLUTE_URL:
                return record.data;

            case NFC_RECORD_TYPES.MIME:
                return `MIME: ${record.mediaType || 'unknown'} - ${record.data}`;

            default:
                // For binary data, show as hex
                if (typeof record.data === 'string') {
                    return record.data;
                }
                return Array.from(new Uint8Array(record.data))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
        }
    } catch (error) {
        console.error('Error formatting record data:', error);
        return 'Error formatting data';
    }
};

/**
 * Create an NDEF message for writing to NFC tag
 * @param {string} text - Text to write
 * @param {string} type - Record type (default: 'text')
 * @returns {Object} NDEF message object
 */
export const createNDEFMessage = (text, type = NFC_RECORD_TYPES.TEXT) => {
    const records = [];

    switch (type) {
        case NFC_RECORD_TYPES.TEXT:
            records.push({
                recordType: NFC_RECORD_TYPES.TEXT,
                data: text
            });
            break;

        case NFC_RECORD_TYPES.URL:
            records.push({
                recordType: NFC_RECORD_TYPES.URL,
                data: text
            });
            break;

        default:
            records.push({
                recordType: NFC_RECORD_TYPES.TEXT,
                data: text
            });
    }

    return { records };
};

/**
 * Validate if a string is a valid URL
 * @param {string} string - String to validate
 * @returns {boolean} True if valid URL
 */
export const isValidURL = (string) => {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getNFCErrorMessage = (error) => {
    if (!error) return 'Unknown error occurred';

    const message = error.message || error.toString();

    if (message.includes('not supported')) {
        return NFC_ERRORS.NOT_SUPPORTED;
    }

    if (message.includes('permission') || message.includes('denied')) {
        return NFC_ERRORS.PERMISSION_DENIED;
    }

    if (message.includes('readable')) {
        return NFC_ERRORS.NOT_READABLE;
    }

    if (message.includes('write')) {
        return NFC_ERRORS.WRITE_FAILED;
    }

    if (message.includes('scan')) {
        return NFC_ERRORS.SCAN_FAILED;
    }

    return message;
};
