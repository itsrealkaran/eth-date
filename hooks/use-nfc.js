"use client";

import { useState, useEffect, useCallback } from "react";
import { isValidURL } from "../utils/nfc";

export const useNFC = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [showGenderSelection, setShowGenderSelection] = useState(false);
  const [settingGender, setSettingGender] = useState(false);
  const [profileId, setProfileId] = useState(null);

  // Check NFC support on component mount
  useEffect(() => {
    // Check if we're in development mode based on hostname
    const isDev =
      typeof window !== "undefined" && window.location.hostname === "localhost";

    if (isDev) {
      // In development mode, always consider NFC as supported
      setIsSupported(true);
      console.log("Development mode: NFC support bypassed");
    } else if ("NDEFReader" in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      setError("NFC is not supported on this device/browser");
    }
  }, []);

  // Function to fetch profile data from Arweave API
  const fetchProfileData = useCallback(async (urlOrId) => {
    try {
      setLoadingProfile(true);
      setError(null);

      // Check if we're in development mode based on hostname
      const isDev =
        typeof window !== "undefined" &&
        window.location.hostname === "localhost";

      const defaultApiUrl = isDev
        ? "http://localhost:3001/etgl"
        : "https://arweave.tech/api/etgl";
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || defaultApiUrl;
      const apiUrl = urlOrId.startsWith("https://")
        ? `${baseUrl}/profile?url=${encodeURIComponent(urlOrId)}`
        : `${baseUrl}/profile/${encodeURIComponent(urlOrId)}`;
      console.log(
        "Fetching from:",
        apiUrl,
        isDev ? "(dev mode)" : "(production)"
      );

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setProfileData(data);
      console.log("Profile data received:", data);

      // Store the profile ID for later use (extract from URL or use directly)
      let id = urlOrId;
      if (urlOrId.startsWith("https://")) {
        // Extract ID from ETHGlobal URL pattern: https://ethglobal.com/connect/{id}
        const urlParts = urlOrId.split("/");
        id = urlParts[urlParts.length - 1];
      }
      setProfileId(id);
      console.log("Profile ID stored:", id);

      // Check if gender is missing and show gender selection UI
      if (data && data.user && !data.user.gender) {
        console.log("Gender not set for user, showing gender selection");
        setShowGenderSelection(true);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError(`Failed to fetch profile data: ${error.message}`);
      setProfileData(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Start NFC scanning
  const startScan = useCallback(async () => {
    if (!isSupported) {
      setError("NFC is not supported");
      return;
    }

    try {
      setError(null);
      setIsScanning(true);

      // Check if we're in development mode based on hostname
      const isDev =
        typeof window !== "undefined" &&
        window.location.hostname === "localhost";

      if (isDev) {
        // Development mode: simulate NFC scanning with mock data
        console.log("Development mode: Mock NFC scanning started");

        // Simulate a delay and then "scan" a mock profile
        setTimeout(async () => {
          console.log("Development mode: Simulating NFC tag detection");

          // Mock ETHGlobal profile URLs for testing (use localhost in dev)
          const demoId = ["1d7s7pl"];

          const randomUrl = demoId[Math.floor(Math.random() * demoId.length)];

          const mockScanData = {
            id: Date.now(),
            serialNumber: "DEV_MOCK_" + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            records: [
              {
                recordType: "url",
                mediaType: null,
                id: "",
                data: randomUrl,
              },
            ],
          };

          setLastScan(mockScanData);
          console.log("Development mode: Mock URL detected:", randomUrl);
          await fetchProfileData(randomUrl);
        }, 2000); // 2 second delay to simulate scanning

        return;
      }

      // Production mode: use real NFC
      const ndef = new NDEFReader();

      // Request permission to use NFC
      await ndef.scan();

      console.log("NFC scan started successfully");

      // Listen for NFC tags
      ndef.addEventListener("reading", async ({ message, serialNumber }) => {
        console.log("NFC tag detected:", { message, serialNumber });

        const scanData = {
          id: Date.now(),
          serialNumber,
          timestamp: new Date().toISOString(),
          records: [],
        };

        // Process NDEF records
        for (const record of message.records) {
          const recordData = {
            recordType: record.recordType,
            mediaType: record.mediaType,
            id: record.id,
            data: null,
          };

          // Decode record data based on type
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding || "utf-8");
            recordData.data = textDecoder.decode(record.data);
          } else if (record.recordType === "url") {
            const textDecoder = new TextDecoder();
            recordData.data = textDecoder.decode(record.data);
          } else {
            // For other types, convert to hex string
            recordData.data = Array.from(new Uint8Array(record.data))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
          }

          scanData.records.push(recordData);
        }

        setLastScan(scanData);

        // Check if any record contains a URL and make API call
        for (const record of scanData.records) {
          if (
            record.recordType === "url" ||
            record.recordType === "absolute-url"
          ) {
            console.log("URL detected in NFC tag:", record.data);
            await fetchProfileData(record.data);
            break; // Only process the first URL found
          } else if (record.recordType === "text" && isValidURL(record.data)) {
            console.log("URL detected in text record:", record.data);
            await fetchProfileData(record.data);
            break;
          }
        }
      });

      ndef.addEventListener("readingerror", () => {
        console.error("Error reading NFC tag");
        setError("Error reading NFC tag");
        setIsScanning(false);
      });
    } catch (error) {
      console.error("NFC scan error:", error);
      setError(error.message || "Failed to start NFC scan");
      setIsScanning(false);
    }
  }, [isSupported]);

  // Stop NFC scanning
  const stopScan = useCallback(() => {
    setIsScanning(false);
    // Note: There's no direct way to stop NDEFReader scanning
    // The scan will continue until the page is refreshed or closed
    console.log("NFC scan stopped");
  }, []);

  // Clear profile data
  const clearProfile = useCallback(() => {
    setProfileData(null);
    setLastScan(null);
    setShowGenderSelection(false);
    setProfileId(null);
  }, []);

  // Set gender for user
  const setGender = useCallback(
    async (gender) => {
      if (!profileData || !profileData.user || !profileId) {
        setError("No profile data or profile ID available");
        return;
      }

      try {
        setSettingGender(true);
        setError(null);

        // Check if we're in development mode based on hostname
        const isDev =
          typeof window !== "undefined" &&
          window.location.hostname === "localhost";

        const defaultApiUrl = isDev
          ? "http://localhost:3001/etgl"
          : "https://arweave.tech/api/etgl";
        const baseUrl = defaultApiUrl;
        const apiUrl = `${baseUrl}/set-gender/${profileId}?gender=${gender}`;

        console.log("Setting gender:", gender, "for profile ID:", profileId);
        console.log("API URL:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to set gender: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();
        console.log("Gender set successfully:", result);

        // Update local profile data
        setProfileData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            gender: gender,
          },
        }));

        // Hide gender selection UI
        setShowGenderSelection(false);
      } catch (error) {
        console.error("Error setting gender:", error);
        setError(`Failed to set gender: ${error.message}`);
      } finally {
        setSettingGender(false);
      }
    },
    [profileData, profileId]
  );

  return {
    isSupported,
    isScanning,
    error,
    lastScan,
    profileData,
    loadingProfile,
    showGenderSelection,
    settingGender,
    startScan,
    stopScan,
    clearProfile,
    setGender,
  };
};
