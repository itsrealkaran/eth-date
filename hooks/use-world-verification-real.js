import { useState, useCallback } from "react";
// Uncomment these imports when @worldcoin/minikit-js is installed
// import { MiniKit, VerifyCommandInput, VerificationLevel, ISuccessResult } from '@worldcoin/minikit-js'

export const useWorldVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const verifyUser = useCallback(
    async (action, signal = null, verificationLevel = "orb") => {
      // Check if MiniKit is available
      if (typeof window === "undefined" || !window.MiniKit) {
        setVerificationError(
          "World App is not installed. Please install World App to continue."
        );
        return { success: false, error: "World App not installed" };
      }

      if (!window.MiniKit.isInstalled()) {
        setVerificationError(
          "World App is not installed. Please install World App to continue."
        );
        return { success: false, error: "World App not installed" };
      }

      setIsVerifying(true);
      setVerificationError(null);

      try {
        const verifyPayload = {
          action,
          signal,
          verification_level: verificationLevel,
        };

        // World App will open a drawer prompting the user to confirm the operation
        const { finalPayload } = await window.MiniKit.commandsAsync.verify(
          verifyPayload
        );

        if (finalPayload.status === "error") {
          setVerificationError("Verification failed. Please try again.");
          return { success: false, error: "Verification failed" };
        }

        // Verify the proof in the backend
        const verifyResponse = await fetch("/api/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: finalPayload,
            action,
            signal,
          }),
        });

        const verifyResponseJson = await verifyResponse.json();

        if (verifyResponseJson.status === 200) {
          setIsVerified(true);
          return { success: true, data: verifyResponseJson };
        } else {
          setVerificationError(
            "Backend verification failed. Please try again."
          );
          return { success: false, error: "Backend verification failed" };
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationError(
          "An error occurred during verification. Please try again."
        );
        return { success: false, error: error.message };
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  const resetVerification = useCallback(() => {
    setIsVerified(false);
    setVerificationError(null);
    setIsVerifying(false);
  }, []);

  return {
    verifyUser,
    isVerifying,
    verificationError,
    isVerified,
    resetVerification,
    isWorldAppInstalled:
      typeof window !== "undefined" &&
      window.MiniKit &&
      window.MiniKit.isInstalled(),
  };
};
