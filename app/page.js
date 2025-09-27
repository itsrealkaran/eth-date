"use client";

import { useState } from "react";
import GenderSelection from "@/components/gender-selection";
import ExploreCanvas from "@/components/explore-canvas";
import Leaderboard from "@/components/leaderboard";

export default function HomePage() {
  const [currentScreen, setCurrentScreen] = useState("gender");
  const [userGender, setUserGender] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleGenderSelect = (gender) => {
    setUserGender(gender);
    setCurrentScreen("explore");
  };

  const toggleLeaderboard = () => {
    setShowLeaderboard(!showLeaderboard);
  };

  return (
    <div className="mobile-container bg-background">
      {currentScreen === "gender" && (
        <GenderSelection onGenderSelect={handleGenderSelect} />
      )}

      {currentScreen === "explore" && (
        <ExploreCanvas
          userGender={userGender}
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
