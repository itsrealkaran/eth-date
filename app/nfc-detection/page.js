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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Profile info */}
            <div className="mb-8">
              {profileData.user.avatar?.fullUrl && (
                <img
                  src={profileData.user.avatar.fullUrl}
                  alt={profileData.user.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                />
              )}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {profileData.user.name}!
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Please select your gender to complete your profile
              </p>
            </div>

            {/* Gender selection buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => setGender("M")}
                disabled={settingGender}
                className={`px-12 py-8 rounded-2xl text-2xl font-bold transition-all duration-200 shadow-lg ${
                  settingGender
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {settingGender ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Setting...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">👨</div>
                    <div>Male</div>
                  </>
                )}
              </button>

              <button
                onClick={() => setGender("F")}
                disabled={settingGender}
                className={`px-12 py-8 rounded-2xl text-2xl font-bold transition-all duration-200 shadow-lg ${
                  settingGender
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-pink-600 text-white hover:bg-pink-700 hover:shadow-xl transform hover:scale-105"
                }`}
              >
                {settingGender ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Setting...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">👩</div>
                    <div>Female</div>
                  </>
                )}
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={clearProfile}
              disabled={settingGender}
              className="mt-8 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
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
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg bg-gray-50 p-4 rounded-lg">
                  {profileData.user.bio}
                </p>
              </div>
            )}

            {/* Badges */}
            {profileData.attendeeTypes &&
              profileData.attendeeTypes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Badges
                  </h3>
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
              <div className="pt-6 border-t border-gray-200 mb-8">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <span className="font-medium">Event:</span>
                  <span className="text-lg">{profileData.event.name}</span>
                </div>
              </div>
            )}

            {/* Confirmation buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
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
                className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors"
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
                className="flex-1 px-8 py-4 bg-gray-200 text-gray-700 rounded-lg text-xl font-semibold hover:bg-gray-300 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* NFC Scanner Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold text-gray-900">
              NFC Profile Scanner
            </h1>
            {typeof window !== "undefined" &&
              window.location.hostname === "localhost" && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  DEV MODE
                </span>
              )}
          </div>
          <p className="text-xl text-gray-600 mb-8">
            {typeof window !== "undefined" &&
            window.location.hostname === "localhost"
              ? "Click to simulate NFC tag scanning"
              : "Tap an NFC tag to view profile"}
          </p>

          <button
            onClick={startScan}
            disabled={isScanning}
            className={`px-16 py-8 rounded-2xl text-2xl font-bold transition-all duration-200 shadow-xl ${
              isScanning
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-2xl transform hover:scale-105"
            }`}
          >
            {isScanning ? (
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <p className="text-lg text-blue-700 mt-6">
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
            className="mt-8 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
