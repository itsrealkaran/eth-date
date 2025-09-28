# Location Tracking Features

This document describes the new location tracking and direction features added to the ETH Date NFC scanner app.

## Features

### 1. Live Location Tracking
- **GPS Tracking**: Continuously tracks your device's GPS location
- **WebSocket Communication**: Sends location updates to the backend server in real-time
- **Auto-reconnection**: Automatically reconnects to the WebSocket server if connection is lost

### 2. Direction Display
- **Selected Users**: Shows directions to randomly selected male and female users
- **Distance Calculation**: Displays distance in meters or kilometers
- **Compass View**: Visual compass showing direction arrows
- **Cardinal Directions**: Shows N, S, E, W, NE, SW, etc.

### 3. User Interface
- **Location Status**: Shows current GPS coordinates and accuracy
- **Connection Status**: Displays WebSocket connection status
- **User Cards**: Separate cards for male and female selected users
- **Real-time Updates**: Direction and distance update as you move

## How It Works

### Backend Integration
The app connects to the WebSocket server defined in `etgl.ts` at `ws://localhost:3002`. The backend:
- Receives GPS coordinates from all connected users
- Randomly selects one male and one female user every hour
- Broadcasts selected users to all connected clients
- Handles proximity verification for user interactions

### Location Calculations
- **Distance**: Uses the Haversine formula to calculate distances between coordinates
- **Bearing**: Calculates the compass bearing from your location to target users
- **Direction**: Converts bearing to cardinal directions (N, NE, E, SE, etc.)

### WebSocket Messages
The app sends and receives these message types:
- `gps_update`: Location coordinates
- `selected_users`: Currently selected male/female users
- `ping/pong`: Keep-alive messages

## Usage

### Development Mode
For development and testing purposes, you can use a fixed user ID:

```bash
# Using npm
DEV=true npm run dev

# Using bun
DEV=true bun run dev

# Or use the predefined script
npm run dev:debug
```

When `DEV=true` is set, the app will:
- Use the fixed user ID `1d7s7pl` instead of generating a random one
- Display "DEV MODE" badge in the UI
- Log development information to the console
- **Bypass NFC support checks** - works on desktop browsers without NFC
- **Mock NFC scanning** - simulate NFC tag detection with test profile URLs
- Show "Simulate Scan" instead of "Start Scan" button
- **Use localhost URLs** - automatically connects to local backend services

### User ID Priority System
The app uses the following priority for determining user ID:
1. **Development Mode**: Fixed ID `1d7s7pl` (when `DEV=true`)
2. **Profile UUID**: Uses `profileData.uuid` from scanned ETHGlobal profile
3. **Fallback**: Generates random ID if no profile is available

Visual indicators show which ID source is being used:
- 🟡 **DEV MODE**: Development fixed ID
- 🟢 **PROFILE UUID**: Real ETHGlobal profile UUID
- ⚪ **FALLBACK**: Generated random ID

### Development Mode URL Configuration
When `DEV=true`, the app automatically uses localhost URLs for all backend services:

**API Endpoints:**
- **Development**: `http://localhost:3000/api/etgl`
- **Production**: `https://arweave.tech/api/etgl`

**WebSocket Connection:**
- **Development**: `ws://localhost:3002`
- **Production**: `wss://arweave.tech:3002`

**Mock Profile URLs:**
- `http://localhost:3000/connect/1d7s7pl`
- `http://localhost:3000/connect/testuser1`
- `http://localhost:3000/connect/testuser2`

**Environment Variable Overrides:**
You can override the default URLs using environment variables:
```bash
# Custom API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api/etgl

# Custom WebSocket URL  
NEXT_PUBLIC_WS_URL=ws://localhost:8081

# Run with custom URLs
DEV=true NEXT_PUBLIC_API_URL=http://localhost:8080/api/etgl npm run dev
```

### Development Mode NFC Simulation
In development mode, the NFC functionality is enhanced for desktop testing:

1. **No NFC Hardware Required**: Works on any desktop browser
2. **Mock Profile URLs**: Uses localhost URLs for testing with local backend
3. **Simulated Delay**: 2-second delay to mimic real NFC tag detection
4. **Visual Feedback**: Shows "Simulating..." and "DEV MODE" badges

### Starting Location Tracking
1. Open the app in a compatible browser (Chrome/Edge with HTTPS)
2. Grant location permissions when prompted
3. Location tracking starts automatically
4. The WebSocket connection establishes automatically

### Reading Directions
1. Wait for users to be selected (happens automatically)
2. View the direction cards showing:
   - Gender symbol (♂️/♀️)
   - Direction arrow pointing toward the user
   - Cardinal direction (N, NE, E, etc.)
   - Distance in meters/kilometers
   - Exact bearing in degrees

### Compass View
- Blue arrow points to selected male user
- Pink arrow points to selected female user
- Compass shows N, E, S, W directions
- Arrows update in real-time as you move

## Technical Requirements

### Browser Support
- Chrome 89+ or Edge 89+ (NFC and WebSocket support)
- HTTPS required for location services
- Location permissions must be granted

### Backend Requirements
- WebSocket server running on port 3002
- Backend API at `https://arweave.tech/api/etgl/`
- Selected users data available from backend

### Permissions
- **Location**: Required for GPS tracking
- **NFC**: Required for profile scanning (existing feature)

## Privacy & Security

### Location Data
- GPS coordinates are only shared with the backend server
- Data is used for proximity calculations and direction finding
- No location history is permanently stored
- User IDs are randomly generated and stored locally

### WebSocket Security
- Connection uses standard WebSocket protocol
- Consider upgrading to WSS (secure WebSocket) for production
- Location data transmission should be encrypted in production

## Troubleshooting

### Common Issues

**"Location access denied"**
- Grant location permissions in browser settings
- Ensure HTTPS is being used
- Check if location services are enabled on device

**"WebSocket connection failed"**
- Verify backend server is running on port 3002
- Check firewall settings
- Ensure WebSocket server is properly initialized

**"No users selected"**
- Wait for backend to select users (happens every hour)
- Check if other users are connected and sharing locations
- Verify backend has user profiles with gender data

**Inaccurate directions**
- Wait for GPS accuracy to improve (may take 30-60 seconds)
- Move to an area with better GPS signal
- Check if target users are also sharing accurate locations

### Debug Information
The app displays:
- Current GPS coordinates and accuracy
- WebSocket connection status
- User ID for debugging
- Selected users timestamp

## Development Notes

### File Structure
- `app/hooks/useLocation.js`: Location tracking and WebSocket logic
- `app/components/LocationTracker.js`: UI component for location display
- `app/components/NFCScanner.js`: Main component with integrated location features

### Key Functions
- `startTracking()`: Begins GPS tracking and WebSocket connection
- `getDirectionInfo()`: Calculates directions to selected users
- `calculateDistance()`: Haversine distance calculation
- `calculateBearing()`: Compass bearing calculation

### WebSocket Events
- Connection management with auto-reconnection
- Real-time location broadcasting
- Selected user updates
- Ping/pong keep-alive mechanism
