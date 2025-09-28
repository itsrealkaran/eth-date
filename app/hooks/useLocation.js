'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export const useLocation = (profileData = null) => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState({ male: null, female: null });
    const [userLocations, setUserLocations] = useState(new Map());
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    const wsRef = useRef(null);
    const watchIdRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const userId = useRef(null);

    // Generate or get user ID - only use profile UUID or dev mode ID
    useEffect(() => {
        // Check if we're in development mode based on hostname
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

        if (isDev) {
            // Use fixed development user ID
            userId.current = '1d7s7pl';
            console.log('Development mode: Using fixed user ID:', userId.current);
        } else if (profileData && profileData.uuid) {
            // Use the actual user UUID from profile data
            userId.current = profileData.uuid;
            console.log('Using profile UUID as user ID:', userId.current);
        } else {
            // No fallback user ID - must have valid profile data
            userId.current = null;
            console.log('No valid user ID available - profile data required');
        }
    }, [profileData]);

    // WebSocket connection management
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            // Check if we're in development mode based on hostname
            const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

            // Connect to the WebSocket server from the etgl.ts backend
            const defaultWsUrl = isDev ? 'ws://localhost:3002' : 'wss://arweave.tech/ws';
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
            wsRef.current = new WebSocket(wsUrl);
            console.log('Connecting to WebSocket:', wsUrl, isDev ? '(dev mode)' : '(production)');

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setConnectionStatus('connected');
                setError(null);

                // Clear any pending reconnection
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    handleWebSocketMessage(message);
                } catch (err) {
                    console.error('Error parsing WebSocket message:', err);
                }
            };

            wsRef.current.onclose = () => {
                console.log('WebSocket disconnected');
                setConnectionStatus('disconnected');

                // Attempt to reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Attempting to reconnect...');
                    connectWebSocket();
                }, 3000);
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionStatus('error');
                setError('WebSocket connection failed');
            };

        } catch (err) {
            console.error('Failed to create WebSocket connection:', err);
            setError('Failed to connect to location service');
        }
    }, []);

    // Handle incoming WebSocket messages
    const handleWebSocketMessage = useCallback((message) => {
        switch (message.type) {
            case 'selected_users':
                console.log('Selected users updated:', message.data);
                setSelectedUsers(message.data);
                break;

            case 'gps_update':
                if (message.userId && message.data) {
                    setUserLocations(prev => {
                        const newMap = new Map(prev);
                        newMap.set(message.userId, message.data);
                        return newMap;
                    });
                }
                break;

            case 'ping':
                // Respond to ping with pong
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: 'pong' }));
                }
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }, []);

    // Check if conditions are met for location tracking
    const canTrackLocation = useCallback(() => {
        // Check if we're in development mode
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

        if (isDev) {
            // In dev mode, always allow tracking
            return true;
        }

        // In production, require valid profile data with gender set
        return profileData &&
            profileData.user &&
            profileData.user.gender &&
            userId.current;
    }, [profileData]);

    // Send location update to server
    const sendLocationUpdate = useCallback((coordinates) => {
        // Only send location data if conditions are met
        if (wsRef.current?.readyState === WebSocket.OPEN && userId.current && canTrackLocation()) {
            const message = {
                type: 'gps_update',
                userId: userId.current,
                data: {
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    accuracy: coordinates.accuracy,
                    timestamp: Date.now()
                }
            };

            wsRef.current.send(JSON.stringify(message));
            console.log('Location update sent for user:', userId.current);
        } else {
            console.log('Location update blocked - conditions not met:', {
                wsReady: wsRef.current?.readyState === WebSocket.OPEN,
                hasUserId: !!userId.current,
                canTrack: canTrackLocation()
            });
        }
    }, [canTrackLocation]);

    // Start location tracking
    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            return;
        }

        if (isTracking) {
            return;
        }

        // Check if conditions are met for location tracking
        if (!canTrackLocation()) {
            const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
            if (!isDev) {
                setError('Location tracking requires NFC profile scan and gender selection');
                return;
            }
        }

        setIsTracking(true);
        setError(null);

        // Connect to WebSocket
        connectWebSocket();

        // Check if we're in development mode based on hostname
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

        // More lenient options for desktop environments
        const options = {
            enableHighAccuracy: false, // Less strict for desktop
            timeout: 30000, // Longer timeout for desktop
            maximumAge: 60000 // Allow older cached positions
        };

        // If in development, use mock location
        if (isDev) {
            console.log('Development mode: Using mock location');
            // Mock location (San Francisco coordinates)
            const mockLocation = {
                latitude: 37.7749 + (Math.random() - 0.5) * 0.01, // Add some randomness
                longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
                accuracy: 50,
                timestamp: Date.now()
            };

            setLocation(mockLocation);
            sendLocationUpdate(mockLocation);
            return;
        }

        const successCallback = (position) => {
            const newLocation = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: Date.now()
            };

            setLocation(newLocation);
            sendLocationUpdate(newLocation);
        };

        const errorCallback = (error) => {
            console.error('Geolocation error:', error);
            let errorMessage = 'Failed to get location';
            let suggestion = '';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied';
                    suggestion = 'Please allow location access in your browser settings and refresh the page.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location unavailable on this device';
                    suggestion = 'Desktop computers may not have GPS. Try using a mobile device or enable location services.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    suggestion = 'Location services may be slow. Try refreshing the page or check your internet connection.';
                    break;
            }

            // For desktop users, provide additional context
            const isDesktop = !('ontouchstart' in window) && !navigator.userAgentData?.mobile;
            if (isDesktop && error.code === error.POSITION_UNAVAILABLE) {
                suggestion = 'Desktop computers typically don\'t have GPS. For the best experience, use a mobile device with location services enabled.';
            }

            setError(`${errorMessage}. ${suggestion}`);

            // Try IP-based geolocation as fallback for desktop
            if (error.code === error.POSITION_UNAVAILABLE) {
                console.log('Attempting IP-based geolocation fallback...');
                tryIPGeolocation();
            }
        };

        // Fallback IP-based geolocation
        const tryIPGeolocation = async () => {
            try {
                console.log('Trying IP geolocation...');
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();

                if (data.latitude && data.longitude) {
                    const fallbackLocation = {
                        latitude: parseFloat(data.latitude),
                        longitude: parseFloat(data.longitude),
                        accuracy: 10000, // IP geolocation is less accurate
                        timestamp: Date.now(),
                        source: 'ip'
                    };

                    console.log('IP geolocation successful:', fallbackLocation);
                    setLocation(fallbackLocation);
                    sendLocationUpdate(fallbackLocation);
                    setError(null); // Clear the error since we got a fallback location
                } else {
                    console.log('IP geolocation failed: no coordinates returned');
                }
            } catch (ipError) {
                console.error('IP geolocation failed:', ipError);
                // Keep the original error message
            }
        };

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
            successCallback,
            errorCallback,
            options
        );

    }, [isTracking, connectWebSocket, sendLocationUpdate]);

    // Stop location tracking
    const stopTracking = useCallback(() => {
        setIsTracking(false);

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        setConnectionStatus('disconnected');
    }, []);

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }, []);

    // Calculate bearing/direction between two coordinates
    const calculateBearing = useCallback((lat1, lon1, lat2, lon2) => {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const x = Math.sin(Δλ) * Math.cos(φ2);
        const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        const θ = Math.atan2(x, y);
        return (θ * 180 / Math.PI + 360) % 360; // Convert to degrees and normalize
    }, []);

    // Get direction info for selected users
    const getDirectionInfo = useCallback(() => {
        if (!location || !selectedUsers) {
            return { male: null, female: null };
        }

        const result = { male: null, female: null };

        // Check male user
        if (selectedUsers.male) {
            const maleLocation = userLocations.get(selectedUsers.male);
            if (maleLocation && maleLocation.coordinates) {
                const distance = calculateDistance(
                    location.latitude,
                    location.longitude,
                    maleLocation.coordinates.latitude,
                    maleLocation.coordinates.longitude
                );
                const bearing = calculateBearing(
                    location.latitude,
                    location.longitude,
                    maleLocation.coordinates.latitude,
                    maleLocation.coordinates.longitude
                );

                result.male = {
                    userId: selectedUsers.male,
                    distance: Math.round(distance),
                    bearing: Math.round(bearing),
                    direction: getCardinalDirection(bearing)
                };
            }
        }

        // Check female user
        if (selectedUsers.female) {
            const femaleLocation = userLocations.get(selectedUsers.female);
            if (femaleLocation && femaleLocation.coordinates) {
                const distance = calculateDistance(
                    location.latitude,
                    location.longitude,
                    femaleLocation.coordinates.latitude,
                    femaleLocation.coordinates.longitude
                );
                const bearing = calculateBearing(
                    location.latitude,
                    location.longitude,
                    femaleLocation.coordinates.latitude,
                    femaleLocation.coordinates.longitude
                );

                result.female = {
                    userId: selectedUsers.female,
                    distance: Math.round(distance),
                    bearing: Math.round(bearing),
                    direction: getCardinalDirection(bearing)
                };
            }
        }

        return result;
    }, [location, selectedUsers, userLocations, calculateDistance, calculateBearing]);

    // Convert bearing to cardinal direction
    const getCardinalDirection = useCallback((bearing) => {
        const directions = [
            'N', 'NNE', 'NE', 'ENE',
            'E', 'ESE', 'SE', 'SSE',
            'S', 'SSW', 'SW', 'WSW',
            'W', 'WNW', 'NW', 'NNW'
        ];

        const index = Math.round(bearing / 22.5) % 16;
        return directions[index];
    }, []);

    // Get arrow rotation for UI
    const getArrowRotation = useCallback((bearing) => {
        return bearing;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, [stopTracking]);

    return {
        location,
        error,
        isTracking,
        selectedUsers,
        userLocations,
        connectionStatus,
        userId: userId.current,
        canTrackLocation,
        startTracking,
        stopTracking,
        getDirectionInfo,
        getArrowRotation,
        calculateDistance,
        calculateBearing
    };
};
