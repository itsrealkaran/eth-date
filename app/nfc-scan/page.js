"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNFC } from "@/hooks/use-nfc"
import { scanNFC } from "@/lib/api"
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  Target, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Smartphone,
  Zap
} from "lucide-react"

export default function NFCScanPage() {
  const [userId, setUserId] = useState(null)
  const [targetProfile, setTargetProfile] = useState(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [isChromeMobile, setIsChromeMobile] = useState(false)
  const [proximityStatus, setProximityStatus] = useState("checking")
  const [scanError, setScanError] = useState(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  const { 
    isNFCAvailable, 
    isScanning: nfcScanning, 
    scannedData, 
    error: nfcError,
    startScanning,
    stopScanning
  } = useNFC()

  // Check if running on Chrome mobile
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isChrome = userAgent.includes('chrome') && !userAgent.includes('edg')
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    setIsChromeMobile(isChrome && isMobile)
  }, [])

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const userIdParam = urlParams.get('userId')
    const targetName = urlParams.get('targetName')
    const targetAvatar = urlParams.get('targetAvatar')
    
    if (userIdParam) {
      setUserId(userIdParam)
    }
    
    if (targetName) {
      setTargetProfile({
        name: decodeURIComponent(targetName),
        avatar: targetAvatar ? decodeURIComponent(targetAvatar) : null
      })
    }
  }, [])

  // Handle NFC scan result
  useEffect(() => {
    if (scannedData && userId) {
      handleNFCScan(scannedData)
    }
  }, [scannedData, userId])

  const handleNFCScan = async (url) => {
    if (!userId || !url) return

    setIsScanning(true)
    setScanError(null)

    try {
      const result = await scanNFC(userId, url)
      
      if (result.success) {
        setScanResult({
          success: true,
          message: result.message,
          targetName: result.targetName,
          pointsEarned: result.pointsEarned,
          totalPoints: result.totalPoints
        })
        setPointsEarned(result.pointsEarned)
        setTotalPoints(result.totalPoints)
      } else {
        setScanResult({
          success: false,
          message: result.error || result.message,
          reason: result.reason
        })
      }
    } catch (error) {
      console.error("NFC scan error:", error)
      setScanError("Failed to process NFC scan. Please try again.")
    } finally {
      setIsScanning(false)
    }
  }

  const startNFCScan = () => {
    setScanResult(null)
    setScanError(null)
    startScanning()
  }

  const closeWindow = () => {
    window.close()
  }

  // Not Chrome Mobile
  if (!isChromeMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Not Applicable
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This feature requires Chrome on Android. Please open this page in Chrome mobile browser.
            </p>
            <Button onClick={closeWindow} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // NFC Not Available
  if (!isNFCAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              NFC Not Supported
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your device doesn't support NFC or it's not enabled. Please enable NFC in your device settings.
            </p>
            <Button onClick={closeWindow} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Success Screen
  if (scanResult?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Scan Successful!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {scanResult.message}
            </p>
            {targetProfile && (
              <div className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                {targetProfile.avatar && (
                  <img 
                    src={targetProfile.avatar} 
                    alt={targetProfile.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {targetProfile.name}
                </span>
              </div>
            )}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  +{pointsEarned} points
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-400">
                Total: {totalPoints}
              </div>
            </div>
            <Button onClick={closeWindow} className="w-full">
              Close
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Error Screen
  if (scanResult && !scanResult.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Scan Failed
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {scanResult.message}
            </p>
            {scanResult.reason && (
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {scanResult.reason}
              </p>
            )}
            <div className="flex space-x-2 w-full">
              <Button onClick={startNFCScan} variant="outline" className="flex-1">
                Try Again
              </Button>
              <Button onClick={closeWindow} className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Main Scan Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Wifi className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Scan Target NFC
          </h2>
          
          {targetProfile && (
            <div className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {targetProfile.avatar && (
                <img 
                  src={targetProfile.avatar} 
                  alt={targetProfile.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {targetProfile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Your target
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4" />
            <span>You're in range!</span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Hold your phone near the target's NFC tag to scan and earn points.
          </p>

          {nfcError && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600 dark:text-red-400">
                {nfcError}
              </span>
            </div>
          )}

          {scanError && (
            <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-red-600 dark:text-red-400">
                {scanError}
              </span>
            </div>
          )}

          <div className="flex space-x-2 w-full">
            {!nfcScanning ? (
              <Button onClick={startNFCScan} className="flex-1">
                {isScanning ? "Processing..." : "Start Scan"}
              </Button>
            ) : (
              <Button onClick={stopScanning} variant="outline" className="flex-1">
                Stop Scan
              </Button>
            )}
            <Button onClick={closeWindow} variant="outline" className="flex-1">
              Close
            </Button>
          </div>

          {nfcScanning && (
            <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Scanning for NFC...</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
