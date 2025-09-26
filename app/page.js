"use client";

import { useState, useEffect } from "react";
import { MiniKit, ResponseEvent } from "@worldcoin/minikit-js";

export default function Home() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (MiniKit.isInstalled()) {
      setIsInstalled(true);
      console.log("MiniKit is installed and ready!");
    } else {
      console.log("MiniKit is not installed");
    }
  }, []);

  const handleWalletAuth = async () => {
    if (!isInstalled) {
      alert("MiniKit is not installed");
      return;
    }

    try {
      const result = await MiniKit.commandsAsync.walletAuth({
        nonce: "test-nonce-" + Date.now(),
      });

      if (result.status === "success") {
        setUserAddress(result.payload.address);
        console.log("Wallet auth successful:", result.payload);
      } else {
        console.error("Wallet auth failed:", result);
      }
    } catch (error) {
      console.error("Wallet auth error:", error);
    }
  };

  const handleVerifyAction = async () => {
    if (!isInstalled) {
      alert("MiniKit is not installed");
      return;
    }

    try {
      const result = await MiniKit.commandsAsync.verifyAction({
        action: "test-action",
        signal: "test-signal",
        verification_level: "Device",
      });

      if (result.status === "success") {
        setVerificationResult("Verification successful!");
        console.log("Verification successful:", result.payload);
      } else {
        setVerificationResult("Verification failed");
        console.error("Verification failed:", result);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationResult("Verification error");
    }
  };

  const handleShare = async () => {
    if (!isInstalled) {
      alert("MiniKit is not installed");
      return;
    }

    try {
      await MiniKit.commandsAsync.share({
        title: "Check out this World Mini App!",
        text: "I just tried out this amazing World Mini App. You should try it too!",
        url: window.location.href,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            World Mini App
          </h1>
          <p className="text-gray-600 mb-8">
            A sample mini app built with World Mini App Kit
          </p>

          <div className="space-y-6">
            {/* Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
              <p
                className={`text-sm ${
                  isInstalled ? "text-green-600" : "text-red-600"
                }`}
              >
                MiniKit: {isInstalled ? "Installed ✅" : "Not Installed ❌"}
              </p>
              {userAddress && (
                <p className="text-sm text-blue-600 mt-1">
                  Wallet: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Actions</h3>

              <button
                onClick={handleWalletAuth}
                disabled={!isInstalled}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Connect Wallet
              </button>

              <button
                onClick={handleVerifyAction}
                disabled={!isInstalled}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Verify with World ID
              </button>

              <button
                onClick={handleShare}
                disabled={!isInstalled}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Share App
              </button>
            </div>

            {/* Results */}
            {verificationResult && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Verification Result
                </h3>
                <p className="text-sm text-gray-700">{verificationResult}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                How to Test
              </h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Open this app in World App</li>
                <li>2. Make sure you have a wallet connected</li>
                <li>3. Try the different actions above</li>
                <li>4. Check the console for detailed logs</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
