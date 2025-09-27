'use client';

import { useNFC } from '../hooks/useNFC';

export default function NFCScanner() {
    const {
        isSupported,
        isScanning,
        error,
        profileData,
        loadingProfile,
        startScan,
        clearProfile
    } = useNFC();

    // Not supported screen
    if (!isSupported) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">NFC Not Supported</h2>
                    <p className="text-red-700 text-lg">
                        Your device or browser doesn't support NFC functionality.
                        Please use a compatible device with Chrome or Edge browser.
                    </p>
                </div>
            </div>
        );
    }

    // Loading profile screen
    if (loadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-3xl font-bold text-blue-900 mb-2">Loading Profile</h2>
                    <p className="text-blue-700 text-lg">Fetching user data...</p>
                </div>
            </div>
        );
    }

    // Profile display screen
    if (profileData && profileData.user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Back button */}
                    <button
                        onClick={clearProfile}
                        className="mb-6 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                    >
                        ← Scan Another
                    </button>

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {/* Avatar and Name */}
                        <div className="text-center mb-8">
                            {profileData.user.avatar?.fullUrl && (
                                <img
                                    src={profileData.user.avatar.fullUrl}
                                    alt={profileData.user.name}
                                    className="w-32 h-32 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-lg"
                                />
                            )}
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {profileData.user.name}
                            </h1>
                            {profileData.user.title && (
                                <p className="text-xl text-blue-700 font-medium mb-4">
                                    {profileData.user.title}
                                </p>
                            )}
                        </div>

                        {/* Bio */}
                        {profileData.user.bio && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                                <p className="text-gray-700 leading-relaxed text-lg bg-gray-50 p-4 rounded-lg">
                                    {profileData.user.bio}
                                </p>
                            </div>
                        )}

                        {/* Badges */}
                        {profileData.attendeeTypes && profileData.attendeeTypes.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Badges</h3>
                                <div className="flex flex-wrap gap-3">
                                    {profileData.attendeeTypes.map((type, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-base font-medium border border-blue-200"
                                        >
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Event Info */}
                        {profileData.event && (
                            <div className="pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-center gap-2 text-gray-600">
                                    <span className="font-medium">Event:</span>
                                    <span className="text-lg">{profileData.event.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
                    <p className="text-red-700 text-lg mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-4 bg-red-600 text-white rounded-lg text-xl font-semibold hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Main scan screen
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">NFC Profile Scanner</h1>
                <p className="text-xl text-gray-600 mb-12">Tap an NFC tag to view profile</p>

                <button
                    onClick={startScan}
                    disabled={isScanning}
                    className={`px-16 py-8 rounded-2xl text-2xl font-bold transition-all duration-200 shadow-xl ${isScanning
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-2xl transform hover:scale-105'
                        }`}
                >
                    {isScanning ? (
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Scanning...</span>
                        </div>
                    ) : (
                        'Start Scan'
                    )}
                </button>

                {isScanning && (
                    <p className="text-lg text-blue-700 mt-6">
                        Ready to scan NFC tags...
                    </p>
                )}
            </div>
        </div>
    );
}
