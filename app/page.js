"use client";

import { useState, useEffect } from "react";
import GenderSelection from "@/components/gender-selection";
import ExploreCanvas from "@/components/explore-canvas";
import Leaderboard from "@/components/leaderboard";
import { checkWorldIDAccount } from "@/lib/api";

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState("loading");
  const [userGender, setUserGender] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAccountStatus();

    // Listen for messages from NFC detection window
    const handleMessage = (event) => {
      if (event.data.type === "NFC_PROFILE_CONFIRMED") {
        setUserProfile(event.data.profile);
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

      const accountStatus = await checkWorldIDAccount();

      if (accountStatus.exists && accountStatus.userId) {
        // Account exists - fetch profile and go directly to explore
        setCurrentScreen("explore");
        // You can fetch the user's profile here if needed
      } else {
        // Account doesn't exist - show NFC detection
        setCurrentScreen("nfc-required");
      }
    } catch (error) {
      setError("Failed to check account status. Please try again.");
      setCurrentScreen("nfc-required");
    } finally {
      setLoading(false);
    }
  };

  const openNFCDetection = () => {
    const nfcWindow = window.open(
      "/nfc-detection",
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

  if (loading) {
    return (
      <div className="mobile-container bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Checking account status...
          </p>
        </div>
      </div>
    );
  }

  if (currentScreen === "nfc-required") {
    return (
      <div className="mobile-container bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-blue-600"
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

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Account Setup Required
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              No account found. Please scan your NFC tag to create your profile
              and start exploring.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            onClick={openNFCDetection}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Scan NFC Tag
          </button>

          <button
            onClick={checkAccountStatus}
            className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Check Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container bg-background">
      {currentScreen === "gender" && (
        <GenderSelection onGenderSelect={handleGenderSelect} />
      )}

      {currentScreen === "explore" && (
        <ExploreCanvas
          userGender={userGender}
          userProfile={userProfile}
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
    </div>
  );
}
