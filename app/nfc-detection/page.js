"use client";

import { useNFC } from "@/hooks/use-nfc";

export default function NFCDetectionPage() {
  const {
    isSupported,
    isScanning,
    error,
    profileData,
    loadingProfile,
    showGenderSelection,
    settingGender,
    startScan,
    clearProfile,
    setGender,
  } = useNFC();

  // Not supported screen
  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-800 mb-4">
            NFC Not Supported
          </h2>
          <p className="text-red-700 text-lg mb-6">
            Your device or browser doesn't support NFC functionality. Please use
            a compatible device with Chrome or Edge browser.
          </p>
          <button
            onClick={() => window.close()}
            className="px-8 py-4 bg-red-600 text-white rounded-lg text-xl font-semibold hover:bg-red-700 transition-colors"
          >
            Close
          </button>
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
          <h2 className="text-3xl font-bold text-blue-900 mb-2">
            Loading Profile
          </h2>
          <p className="text-blue-700 text-lg">Fetching user data...</p>
        </div>
      </div>
    );
  }

  // Gender selection screen
  if (showGenderSelection && profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
        <div className="max-w-sm mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            {/* Profile info */}
            <div className="mb-6">
              {profileData.user.avatar?.fullUrl && (
                <img
                  src={profileData.user.avatar.fullUrl}
                  alt={profileData.user.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                />
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {profileData.user.name}!
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Please select your gender to complete your profile
              </p>
            </div>

            {/* Gender selection buttons */}
            <div className="space-y-4 mb-6">
              <button
                onClick={() => setGender("M")}
                disabled={settingGender}
                className={`w-full px-8 py-6 rounded-2xl text-xl font-bold transition-all duration-200 shadow-lg ${
                  settingGender
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {settingGender ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Setting...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">👨</div>
                    <div>Male</div>
                  </>
                )}
              </button>

              <button
                onClick={() => setGender("F")}
                disabled={settingGender}
                className={`w-full px-8 py-6 rounded-2xl text-xl font-bold transition-all duration-200 shadow-lg ${
                  settingGender
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-pink-600 text-white hover:bg-pink-700 hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {settingGender ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Setting...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2">👩</div>
                    <div>Female</div>
                  </>
                )}
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={clearProfile}
              disabled={settingGender}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Profile display screen with confirmation
  if (profileData && profileData.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-sm mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            {/* Avatar and Name */}
            <div className="text-center mb-6">
              {profileData.user.avatar?.fullUrl && (
                <img
                  src={profileData.user.avatar.fullUrl}
                  alt={profileData.user.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {profileData.user.name}
              </h1>
              {profileData.user.title && (
                <p className="text-lg text-blue-700 font-medium mb-3">
                  {profileData.user.title}
                </p>
              )}
            </div>

            {/* Bio */}
            {profileData.user.bio && (
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-800 mb-2">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-3 rounded-lg">
                  {profileData.user.bio}
                </p>
              </div>
            )}

            {/* Badges */}
            {profileData.attendeeTypes &&
              profileData.attendeeTypes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">
                    Badges
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.attendeeTypes.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Event Info */}
            {profileData.event && (
              <div className="pt-4 border-t border-gray-200 mb-6">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <span className="font-medium text-sm">Event:</span>
                  <span className="text-base">{profileData.event.name}</span>
                </div>
              </div>
            )}

            {/* Confirmation buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (window.opener) {
                    window.opener.postMessage(
                      {
                        type: "NFC_PROFILE_CONFIRMED",
                        profile: profileData,
                      },
                      "*"
                    );
                  }
                  window.close();
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
              >
                Confirm & Continue
              </button>
              <button
                onClick={() => {
                  if (window.opener) {
                    window.opener.postMessage(
                      {
                        type: "NFC_DETECTION_CANCELLED",
                      },
                      "*"
                    );
                  }
                  window.close();
                }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
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
            className="px-8 py-4 bg-red-600 text-white rounded-lg text-xl font-semibold hover:bg-red-700 transition-colors mr-4"
          >
            Try Again
          </button>
          <button
            onClick={() => window.close()}
            className="px-8 py-4 bg-gray-600 text-white rounded-lg text-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Main scan screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-sm mx-auto pt-8">
        {/* NFC Scanner Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">NFC Scanner</h1>
              {typeof window !== "undefined" &&
                window.location.hostname === "localhost" && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    DEV
                  </span>
                )}
            </div>
            <p className="text-lg text-gray-600 mb-6">
              {typeof window !== "undefined" &&
              window.location.hostname === "localhost"
                ? "Click to simulate NFC tag scanning"
                : "Tap an NFC tag to view profile"}
            </p>
          </div>

          <button
            onClick={startScan}
            disabled={isScanning}
            className={`w-full px-8 py-6 rounded-2xl text-xl font-bold transition-all duration-200 shadow-lg mb-4 ${
              isScanning
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {isScanning ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {typeof window !== "undefined" &&
                  window.location.hostname === "localhost"
                    ? "Simulating..."
                    : "Scanning..."}
                </span>
              </div>
            ) : typeof window !== "undefined" &&
              window.location.hostname === "localhost" ? (
              "Simulate Scan"
            ) : (
              "Start Scan"
            )}
          </button>

          {isScanning && (
            <p className="text-base text-blue-700 mb-4">
              {typeof window !== "undefined" &&
              window.location.hostname === "localhost"
                ? "Simulating NFC tag detection..."
                : "Ready to scan NFC tags..."}
            </p>
          )}

          <button
            onClick={() => {
              if (window.opener) {
                window.opener.postMessage(
                  {
                    type: "NFC_DETECTION_CANCELLED",
                  },
                  "*"
                );
              }
              window.close();
            }}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
