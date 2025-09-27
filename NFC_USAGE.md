# NFC Scanner Usage Guide

## Overview
This application provides NFC (Near Field Communication) scanning and writing capabilities using the Web NFC API.

## Features
- **Scan NFC Tags**: Read NDEF (NFC Data Exchange Format) messages from NFC tags
- **Write to NFC Tags**: Write text data to compatible NFC tags
- **Scan History**: View previously scanned tags with timestamps
- **Real-time Feedback**: Get immediate feedback on scan results and errors

## Browser Support
The Web NFC API is currently supported in:
- Chrome 89+ on Android
- Edge 89+ on Android
- **Note**: NFC functionality requires HTTPS or localhost

## How to Use

### Scanning NFC Tags
1. Click the "Start Scan" button
2. Bring an NFC tag close to your device (within 4cm)
3. The app will automatically detect and display the tag's contents
4. View the scan results including:
   - Serial number
   - Timestamp
   - NDEF records (text, URLs, etc.)

### Writing to NFC Tags
1. Enter the text you want to write in the input field
2. Click the "Write" button
3. Bring a writable NFC tag close to your device
4. The app will write the text to the tag

### Scan History
- All scanned tags are automatically saved to history
- View up to 10 recent scans
- Clear history using the "Clear" button

## Supported NFC Record Types
- **Text**: Plain text messages
- **URL**: Web URLs and links
- **MIME**: Media type records
- **Binary**: Raw binary data (displayed as hex)

## Troubleshooting

### "NFC Not Supported" Error
- Ensure you're using a compatible browser (Chrome/Edge on Android)
- Check that your device has NFC capability
- Make sure NFC is enabled in device settings

### Permission Denied
- Grant NFC permissions when prompted by the browser
- Check browser settings for site permissions

### Scan Failures
- Ensure the NFC tag is within 4cm of your device
- Try different positions and angles
- Some tags may be read-only or corrupted

### Write Failures
- Ensure the NFC tag is writable
- Check that the tag has sufficient storage space
- Some tags may be locked or protected

## Security Considerations
- Only scan NFC tags from trusted sources
- Be cautious with URLs and links found on NFC tags
- The app runs over HTTPS to ensure secure communication

## Development Notes
- Uses the Web NFC API (`NDEFReader`)
- Built with React hooks for state management
- Responsive design with Tailwind CSS
- Error handling and user feedback included
