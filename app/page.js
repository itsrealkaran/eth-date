"use client";

import { useState, useEffect } from "react";
import GenderSelection from "@/components/gender-selection";
import ExploreCanvas from "@/components/explore-canvas";
import Leaderboard from "@/components/leaderboard";
import WorldVerification from "@/components/world-verification";
import { getProfileByWorldID } from "@/lib/api";

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState("loading");
  const [userGender, setUserGender] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWorldVerification, setShowWorldVerification] = useState(false);
  const [isWorldVerified, setIsWorldVerified] = useState(false);

  useEffect(() => {
    checkAccountStatus();

    // Listen for messages from NFC detection window
    const handleMessage = (event) => {
      if (event.data.type === "NFC_PROFILE_CONFIRMED") {
        setUserProfile(event.data.profile);

        // Store WorldID in localStorage for future sessions
        const worldId = new URLSearchParams(window.location.search).get(
          "worldid"
        );
        if (worldId) {
          localStorage.setItem("worldId", worldId);
        }

        // If profile has gender, go directly to explore, otherwise show gender selection
        if (event.data.profile.user.gender) {
          setUserGender(
            event.data.profile.user.gender === "M" ? "male" : "female"
          );
          setCurrentScreen("explore");
        } else {
          setCurrentScreen("gender");
        }
      } else if (event.data.type === "NFC_DETECTION_CANCELLED") {
        setError("NFC detection was cancelled. Please try again.");
        setCurrentScreen("nfc-required");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const checkAccountStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user has a stored World ID from previous verification
      const storedWorldId = localStorage.getItem("worldId");
      if (storedWorldId) {
        console.log("Found stored World ID:", storedWorldId);
      } else {
        console.log("No stored World ID found - user needs to verify");
        setCurrentScreen("nfc-required");
        return;
      }

      try {
        const response = await getProfileByWorldID(storedWorldId);
        console.log("API Response:", response);

        // Handle the nested profile structure
        const profile = response.profile || response;

        if (profile && profile.user) {
          setUserProfile(profile);
          // If profile has gender, go directly to explore
          if (profile.user.gender) {
            setUserGender(profile.user.gender === "M" ? "male" : "female");
            setCurrentScreen("explore");
          } else {
            setCurrentScreen("gender");
          }
          return;
        }
      } catch (profileError) {
        console.log(
          "Profile not found for World ID, proceeding to NFC detection"
        );
        console.error("Profile fetch error:", profileError);
      }

      // Profile not found - show NFC detection
      setCurrentScreen("nfc-required");
    } catch (error) {
      console.error("Error checking account status:", error);
      setError("Failed to check account status. Please try again.");
      setCurrentScreen("nfc-required");
    } finally {
      setLoading(false);
    }
  };

  const openNFCDetection = () => {
    // Get the stored World ID from verification
    const storedWorldId = localStorage.getItem("worldId");

    if (!storedWorldId) {
      setError("No World ID found. Please verify with World ID first.");
      return;
    }

    const worldIdParam = `?worldid=${storedWorldId}`;

    const nfcWindow = window.open(
      `/nfc-detection${worldIdParam}`,
      "nfc-detection",
      "width=400,height=600,scrollbars=yes,resizable=yes"
    );

    if (!nfcWindow) {
      setError(
        "Popup blocked. Please allow popups for this site and try again."
      );
    }
  };

  const handleGenderSelect = (gender) => {
    setUserGender(gender);
    setCurrentScreen("explore");
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  const handleWorldVerificationSuccess = (data) => {
    console.log("World ID verification successful:", data);

    // Extract the nullifier_hash as the unique World ID
    const worldId =
      data.verifyRes?.nullifier_hash || data.verifyRes?.merkle_root;

    if (worldId) {
      // Store the actual World ID for this session
      localStorage.setItem("worldId", worldId);
      console.log("Stored World ID:", worldId);
    }

    setIsWorldVerified(true);
    setShowWorldVerification(false);
    // Proceed with NFC detection after successful verification
    openNFCDetection();
  };

  const handleWorldVerificationError = (error) => {
    console.error("World ID verification failed:", error);
    setError(`Verification failed: ${error}`);
  };

  const startVerificationFlow = () => {
    setShowWorldVerification(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-blue-900 mb-2">
            Checking Account
          </h2>
          <p className="text-blue-700 text-lg">
            Verifying your account status...
          </p>
        </div>
      </div>
    );
  }

  if (currentScreen === "nfc-required") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to Rizzler
              </h1>
              <p className="text-xl text-gray-600 mb-2">
                Account Setup Required
              </p>
              <p className="text-gray-600">
                No account found. Please scan your NFC tag to create your
                profile and start exploring.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={startVerificationFlow}
                className="w-full px-8 py-4 bg-blue-600 text-white rounded-lg text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isWorldVerified ? "Scan NFC Tag" : "Verify with World ID"}
              </button>

              {isWorldVerified && (
                <button
                  onClick={openNFCDetection}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue to NFC Scan
                </button>
              )}

              <button
                onClick={checkAccountStatus}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Check Again
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? Make sure you're using Chrome on an Android device
                with NFC enabled.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentScreen === "gender" && (
        <GenderSelection onGenderSelect={handleGenderSelect} />
      )}

      {currentScreen === "explore" && (
        <ExploreCanvas
          userGender={userGender}
          userProfile={userProfile}
          userWorldId={localStorage.getItem("worldId") || "unknown"}
          onToggleLeaderboard={toggleLeaderboard}
          showLeaderboard={showLeaderboard}
        />
      )}

      {showLeaderboard && (
        <Leaderboard
          onClose={() => setShowLeaderboard(false)}
          isVisible={showLeaderboard}
        />
      )}

      {showWorldVerification && (
        <WorldVerification
          onVerificationSuccess={handleWorldVerificationSuccess}
          onVerificationError={handleWorldVerificationError}
          action="rizzlerverification"
          signal="rizzler-app"
          verificationLevel={null}
        />
      )}
    </div>
  );
}
