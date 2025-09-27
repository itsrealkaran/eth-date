'use client';

import { useLocation } from '../hooks/useLocation';
import { useEffect, useState } from 'react';

export default function LocationTracker({ profileData = null }) {
    const {
        location,
        error,
        isTracking,
        selectedUsers,
        connectionStatus,
        userId,
        canTrackLocation,
        startTracking,
        stopTracking,
        getDirectionInfo,
        getArrowRotation
    } = useLocation(profileData);

    // Local state for demo location
    const [localLocation, setLocalLocation] = useState(null);
    const [localError, setLocalError] = useState(null);

    // Use local location if set, otherwise use hook location
    const currentLocation = localLocation || location;
    const currentError = localError || error;

    const [directionInfo, setDirectionInfo] = useState({ male: null, female: null });

    // Update direction info when location or selected users change
    useEffect(() => {
        const info = getDirectionInfo();
        setDirectionInfo(info);
    }, [currentLocation, selectedUsers, getDirectionInfo]);

    // Auto-start tracking when component mounts and conditions are met
    useEffect(() => {
        if (!isTracking && canTrackLocation()) {
            startTracking();
        }

        return () => {
            stopTracking();
        };
    }, [canTrackLocation, isTracking, startTracking, stopTracking]);

    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance}m`;
        } else {
            return `${(distance / 1000).toFixed(1)}km`;
        }
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return 'text-green-600';
            case 'connecting': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'error': return 'Connection Error';
            default: return 'Disconnected';
        }
    };

    // Direction arrow component
    const DirectionArrow = ({ bearing, color = 'text-blue-600' }) => (
        <div
            className={`w-8 h-8 ${color} transform transition-transform duration-300`}
            style={{ transform: `rotate(${bearing}deg)` }}
        >
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            </svg>
        </div>
    );

    // User direction card component
    const UserDirectionCard = ({ userInfo, gender, bgColor, textColor }) => {
        if (!userInfo) {
            return (
                <div className={`${bgColor} rounded-lg p-4 text-center`}>
                    <div className={`text-2xl font-bold ${textColor} mb-2`}>
                        {gender === 'male' ? '♂️' : '♀️'} {gender.toUpperCase()}
                    </div>
                    <div className="text-gray-500">No user selected</div>
                </div>
            );
        }

        return (
            <div className={`${bgColor} rounded-lg p-4 text-center`}>
                <div className={`text-2xl font-bold ${textColor} mb-2`}>
                    {gender === 'male' ? '♂️' : '♀️'} {gender.toUpperCase()}
                </div>
                <div className="flex items-center justify-center mb-2">
                    <DirectionArrow
                        bearing={userInfo.bearing}
                        color={textColor}
                    />
                </div>
                <div className={`font-semibold ${textColor}`}>
                    {userInfo.direction}
                </div>
                <div className="text-sm text-gray-600">
                    {formatDistance(userInfo.distance)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {userInfo.bearing}°
                </div>
            </div>
        );
    };

    // Show notice when location tracking is disabled due to missing conditions
    if (!canTrackLocation()) {
        const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        if (!isDev) {
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                        <div className="text-blue-600 mr-2">🔒</div>
                        <div>
                            <div className="font-semibold text-blue-800">Location Tracking Disabled</div>
                            <div className="text-blue-700 text-sm">
                                Location tracking requires NFC profile scan and gender selection.
                                {!profileData && ' Please scan an NFC tag first.'}
                                {profileData && !profileData.user?.gender && ' Please complete gender selection.'}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    // Show error only if we don't have any location (including fallback)
    if (currentError && !currentLocation) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                    <div className="text-yellow-600 mr-2">📍</div>
                    <div>
                        <div className="font-semibold text-yellow-800">Location Notice</div>
                        <div className="text-yellow-700 text-sm">{currentError}</div>
                    </div>
                </div>
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={startTracking}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                    >
                        Retry Location
                    </button>
                    <button
                        onClick={() => {
                            // Use a default location for demo purposes
                            const demoLocation = {
                                latitude: 37.7749,
                                longitude: -122.4194,
                                accuracy: 1000,
                                timestamp: Date.now(),
                                source: 'demo'
                            };
                            setLocalLocation(demoLocation);
                            setLocalError(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                        Use Demo Location
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Location Tracker</h2>
                <div className="flex items-center space-x-4">
                    <div className={`text-sm ${getConnectionStatusColor()}`}>
                        {getConnectionStatusText()}
                    </div>
                    <button
                        onClick={isTracking ? stopTracking : startTracking}
                        disabled={!canTrackLocation() && !isTracking}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!canTrackLocation() && !isTracking
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : isTracking
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                    >
                        {isTracking ? 'Stop' : 'Start'} Tracking
                    </button>
                </div>
            </div>

            {/* Location Status */}
            <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Your Location:</div>
                {currentLocation ? (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm">
                            <div className="flex items-center gap-2">
                                <span>📍 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</span>
                                {currentLocation.source === 'ip' && (
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                                        IP-based
                                    </span>
                                )}
                                {currentLocation.source === 'demo' && (
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                        Demo
                                    </span>
                                )}
                            </div>
                            <div className="text-gray-500 mt-1">
                                Accuracy: ±{Math.round(currentLocation.accuracy)}m
                                {currentLocation.source === 'ip' && (
                                    <span className="text-orange-600 ml-2">(Approximate location)</span>
                                )}
                                {currentLocation.source === 'demo' && (
                                    <span className="text-blue-600 ml-2">(Demo location)</span>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-lg p-3 text-gray-500 text-sm">
                        {isTracking ? 'Getting location...' : 'Location tracking disabled'}
                    </div>
                )}
            </div>

            {/* Profile Info */}
            {profileData && profileData.user && (
                <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">Your Profile:</div>
                    <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                        {profileData.user.avatar?.fullUrl && (
                            <img
                                src={profileData.user.avatar.fullUrl}
                                alt={profileData.user.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        )}
                        <div className="flex-1">
                            <div className="font-medium text-gray-900">{profileData.user.name}</div>
                            {profileData.user.title && (
                                <div className="text-sm text-gray-600">{profileData.user.title}</div>
                            )}
                        </div>
                        {profileData.user.gender && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${profileData.user.gender === 'M'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-pink-100 text-pink-800'
                                }`}>
                                {profileData.user.gender === 'M' ? '♂️ Male' : '♀️ Female'}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* User ID */}
            <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Your ID:</div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm font-mono flex items-center justify-between">
                    <span>{userId}</span>
                    <div className="flex gap-2">
                        {userId === '1d7s7pl' && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                DEV MODE
                            </span>
                        )}
                        {profileData && profileData.uuid && userId === profileData.uuid && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                PROFILE UUID
                            </span>
                        )}
                        {!userId && (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                NO USER ID
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Users Info */}
            <div className="mb-6">
                <div className="text-sm text-gray-600 mb-3">Selected Users:</div>
                {selectedUsers.male || selectedUsers.female ? (
                    <div className="text-xs text-gray-500 mb-3">
                        Selected at: {selectedUsers.selectedAt ?
                            new Date(selectedUsers.selectedAt).toLocaleTimeString() :
                            'Unknown'
                        }
                    </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UserDirectionCard
                        userInfo={directionInfo.male}
                        gender="male"
                        bgColor="bg-blue-50"
                        textColor="text-blue-700"
                    />
                    <UserDirectionCard
                        userInfo={directionInfo.female}
                        gender="female"
                        bgColor="bg-pink-50"
                        textColor="text-pink-700"
                    />
                </div>
            </div>

            {/* Compass */}
            {currentLocation && (directionInfo.male || directionInfo.female) && (
                <div className="text-center">
                    <div className="text-sm text-gray-600 mb-3">Compass View</div>
                    <div className="relative w-32 h-32 mx-auto bg-gray-100 rounded-full border-2 border-gray-300">
                        {/* Compass directions */}
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">N</div>
                        <div className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-700">E</div>
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-700">S</div>
                        <div className="absolute left-1 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-700">W</div>

                        {/* Direction arrows */}
                        {directionInfo.male && (
                            <div
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={{ transform: `translate(-50%, -50%) rotate(${directionInfo.male.bearing}deg)` }}
                            >
                                <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
                                <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-blue-600 ml-10 -mt-1"></div>
                            </div>
                        )}

                        {directionInfo.female && (
                            <div
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                                style={{ transform: `translate(-50%, -50%) rotate(${directionInfo.female.bearing}deg)` }}
                            >
                                <div className="w-10 h-1 bg-pink-600 rounded-full"></div>
                                <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-pink-600 ml-8 -mt-1"></div>
                            </div>
                        )}

                        {/* Center dot */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-6 text-xs text-gray-500 text-center">
                <div>🔵 Blue arrow points to selected male user</div>
                <div>🔴 Pink arrow points to selected female user</div>
                <div className="mt-2">Make sure location services are enabled for accurate tracking</div>
            </div>
        </div>
    );
}
