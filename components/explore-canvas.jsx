"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Users, Navigation, Target, Plus, Minus, Maximize2, Compass, Map, MapPin, Zap, Smartphone } from "lucide-react"
import { useWebSocket } from "@/hooks/use-websocket"
import { getTargetByWorldID, scanNFC } from "@/lib/api"

export default function ExploreCanvas({ userGender, onToggleLeaderboard, showLeaderboard, userWorldId }) {
  const canvasRef = useRef(null)
  const [userPosition, setUserPosition] = useState({ x: 200, y: 300 })
  const [targetCoordinate, setTargetCoordinate] = useState(null)
  const [nearestUser, setNearestUser] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState("compass") // "compass" or "map"
  const [compassAngle, setCompassAngle] = useState(0)
  const [distanceToTarget, setDistanceToTarget] = useState(0)
  const { isConnected, users, error, sendPosition } = useWebSocket()
  
  // Location and target states
  const [userLocation, setUserLocation] = useState(null)
  const [targetLocation, setTargetLocation] = useState(null)
  const [targetProfile, setTargetProfile] = useState(null)
  const [locationPermission, setLocationPermission] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [isLoadingTarget, setIsLoadingTarget] = useState(false)
  const [targetError, setTargetError] = useState(null)
  
  // Proximity and NFC states
  const [isInProximity, setIsInProximity] = useState(false)
  const [proximityDistance, setProximityDistance] = useState(null)
  const [showNFCButton, setShowNFCButton] = useState(false)
  const [nfcScanResult, setNfcScanResult] = useState(null)
  const [isScanningNFC, setIsScanningNFC] = useState(false)
  const [nfcError, setNfcError] = useState(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  // Request location permission
  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      return false
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(permission.state)
      
      if (permission.state === 'denied') {
        setLocationError("Location permission denied. Please enable location access in your browser settings.")
        return false
      }

      return true
    } catch (error) {
      console.error("Error checking location permission:", error)
      setLocationError("Failed to check location permission")
      return false
    }
  }

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
          setUserLocation(location)
          setLocationError(null)
          resolve(location)
        },
        (error) => {
          console.error("Location error:", error)
          setLocationError(`Location error: ${error.message}`)
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }

  // Fetch target information
  const fetchTarget = async () => {
    if (!userWorldId) return

    setIsLoadingTarget(true)
    setTargetError(null)

    try {
      const targetData = await getTargetByWorldID(userWorldId)
      
      if (targetData.coordinates) {
        setTargetLocation(targetData.coordinates)
        setTargetProfile(targetData.targetProfile)
        
        // Calculate distance if we have user location
        if (userLocation) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            targetData.coordinates.latitude,
            targetData.coordinates.longitude
          )
          setDistanceToTarget(distance)
        }
      }
    } catch (error) {
      console.error("Error fetching target:", error)
      setTargetError("Failed to fetch target information")
    } finally {
      setIsLoadingTarget(false)
    }
  }

  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  // Calculate compass bearing to target
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)

    const bearing = Math.atan2(y, x) * (180 / Math.PI)
    return (bearing + 360) % 360 // Normalize to 0-360
  }

  // Initialize location and target
  useEffect(() => {
    const initializeLocation = async () => {
      const hasPermission = await requestLocationPermission()
      if (hasPermission) {
        try {
          await getCurrentLocation()
        } catch (error) {
          console.error("Failed to get initial location:", error)
        }
      }
    }

    initializeLocation()
  }, [])

  // Fetch target when userWorldId is available
  useEffect(() => {
    if (userWorldId) {
      fetchTarget()
    }
  }, [userWorldId])

  // Poll for location updates every 30 seconds
  useEffect(() => {
    if (locationPermission === 'granted') {
      const interval = setInterval(async () => {
        try {
          await getCurrentLocation()
        } catch (error) {
          console.error("Location polling error:", error)
        }
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [locationPermission])

  // Poll for target updates every 60 seconds
  useEffect(() => {
    if (userWorldId) {
      const interval = setInterval(() => {
        fetchTarget()
      }, 60000)

      return () => clearInterval(interval)
    }
  }, [userWorldId])

  // Update compass angle when locations change
  useEffect(() => {
    if (userLocation && targetLocation) {
      const bearing = calculateBearing(
        userLocation.latitude,
        userLocation.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      )
      setCompassAngle(bearing)
    }
  }, [userLocation, targetLocation])

  useEffect(() => {
    if (users.length > 0 && userGender) {
      // Find the nearest user of opposite gender
      const oppositeGenderUsers = users.filter(user => user.gender !== userGender)
      
      if (oppositeGenderUsers.length > 0) {
        let nearest = oppositeGenderUsers[0]
        let minDistance = Number.POSITIVE_INFINITY

        oppositeGenderUsers.forEach((user) => {
          const dx = user.x - userPosition.x
          const dy = user.y - userPosition.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < minDistance) {
            minDistance = distance
            nearest = user
          }
        })

        setNearestUser(nearest)
        setTargetCoordinate({ x: nearest.x, y: nearest.y })
        setDistanceToTarget(minDistance)

        // Calculate compass angle to target
        const dx = nearest.x - userPosition.x
        const dy = nearest.y - userPosition.y
        const angle = Math.atan2(dy, dx) * (180 / Math.PI)
        setCompassAngle(angle)
      } else {
        setNearestUser(null)
        setTargetCoordinate(null)
        setDistanceToTarget(0)
      }
    }
  }, [users, userPosition, userGender])

  const renderCompass = (ctx, canvas) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width / 2
    )
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.1)")
    gradient.addColorStop(1, "rgba(99, 102, 241, 0.02)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw compass circle
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(canvas.width, canvas.height) * 0.3

    // Outer ring
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Inner circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    ctx.fill()
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)"
    ctx.lineWidth = 1
    ctx.stroke()

    if (targetLocation && userLocation && distanceToTarget > 0) {
      // Draw directional arrow
      const arrowLength = radius * 0.7
      const arrowAngle = (compassAngle * Math.PI) / 180
      
      const arrowX = centerX + Math.cos(arrowAngle) * arrowLength
      const arrowY = centerY + Math.sin(arrowAngle) * arrowLength

      // Arrow shaft
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(arrowX, arrowY)
      ctx.strokeStyle = userGender === "male" ? "#6366f1" : "#10b981"
      ctx.lineWidth = 6
      ctx.stroke()

      // Arrow head
      const headLength = 20
      const headAngle = Math.PI / 6
      
      ctx.beginPath()
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(
        arrowX - headLength * Math.cos(arrowAngle - headAngle),
        arrowY - headLength * Math.sin(arrowAngle - headAngle)
      )
      ctx.moveTo(arrowX, arrowY)
      ctx.lineTo(
        arrowX - headLength * Math.cos(arrowAngle + headAngle),
        arrowY - headLength * Math.sin(arrowAngle + headAngle)
      )
      ctx.strokeStyle = userGender === "male" ? "#4f46e5" : "#059669"
      ctx.lineWidth = 8
      ctx.stroke()

      // Center dot
      ctx.beginPath()
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI)
      ctx.fillStyle = userGender === "male" ? "#4f46e5" : "#059669"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Distance indicator
      const distanceRadius = Math.max(20, Math.min(radius * 0.8, distanceToTarget * 0.01))
      ctx.beginPath()
      ctx.arc(centerX, centerY, distanceRadius, 0, 2 * Math.PI)
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])
    } else {
      // No target - show center dot only
      ctx.beginPath()
      ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(148, 163, 184, 0.5)"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }

  const renderMap = (ctx, canvas) => {
    // Original map rendering logic
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(zoom, zoom)
    ctx.translate(-canvas.width / 2 + cameraOffset.x, -canvas.height / 2 + cameraOffset.y)

    ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 3, canvas.height * 3)

    ctx.strokeStyle = "rgba(148, 163, 184, 0.1)"
    ctx.lineWidth = 1

    const gridSize = 60
    for (let i = -canvas.width; i < canvas.width * 2; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(i, -canvas.height)
      ctx.lineTo(i, canvas.height * 2)
      ctx.stroke()
    }
    for (let i = -canvas.height; i < canvas.height * 2; i += gridSize) {
      ctx.beginPath()
      ctx.moveTo(-canvas.width, i)
      ctx.lineTo(canvas.width * 2, i)
      ctx.stroke()
    }

    users.forEach((user) => {
      // Outer glow effect
      ctx.beginPath()
      ctx.arc(user.x, user.y, 25, 0, 2 * Math.PI)
      const glowGradient = ctx.createRadialGradient(user.x, user.y, 0, user.x, user.y, 25)
      if (user.gender === "male") {
        glowGradient.addColorStop(0, "rgba(99, 102, 241, 0.3)")
        glowGradient.addColorStop(1, "rgba(99, 102, 241, 0)")
      } else {
        glowGradient.addColorStop(0, "rgba(16, 185, 129, 0.3)")
        glowGradient.addColorStop(1, "rgba(16, 185, 129, 0)")
      }
      ctx.fillStyle = glowGradient
      ctx.fill()

      // Main user circle
      ctx.beginPath()
      ctx.arc(user.x, user.y, 12, 0, 2 * Math.PI)
      if (user.gender === "male") {
        ctx.fillStyle = "#6366f1"
      } else {
        ctx.fillStyle = "#10b981"
      }
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(user.x + 10, user.y - 10, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "#fbbf24"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 8px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("5", user.x + 10, user.y - 7)

      if (nearestUser && user.id === nearestUser.id) {
        ctx.fillStyle = "#374151"
        ctx.font = "600 11px sans-serif"
        ctx.textAlign = "center"
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.strokeText(user.name, user.x, user.y + 28)
        ctx.fillText(user.name, user.x, user.y + 28)
      }
    })

    const time = Date.now() * 0.003
    const pulseSize = 16 + Math.sin(time) * 2

    // Outer pulse ring
    ctx.beginPath()
    ctx.arc(userPosition.x, userPosition.y, pulseSize + 8, 0, 2 * Math.PI)
    ctx.strokeStyle = userGender === "male" ? "rgba(99, 102, 241, 0.4)" : "rgba(16, 185, 129, 0.4)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Main user circle
    ctx.beginPath()
    ctx.arc(userPosition.x, userPosition.y, pulseSize, 0, 2 * Math.PI)
    if (userGender === "male") {
      ctx.fillStyle = "#4f46e5"
    } else {
      ctx.fillStyle = "#059669"
    }
    ctx.fill()
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 3
    ctx.stroke()

    if (targetCoordinate && nearestUser) {
      const dx = targetCoordinate.x - userPosition.x
      const dy = targetCoordinate.y - userPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 40) {
        const angle = Math.atan2(dy, dx)
        const arrowLength = Math.min(distance * 0.5, 60)

        ctx.beginPath()
        ctx.moveTo(userPosition.x, userPosition.y)
        ctx.lineTo(userPosition.x + Math.cos(angle) * arrowLength, userPosition.y + Math.sin(angle) * arrowLength)
        ctx.strokeStyle = "#fbbf24"
        ctx.lineWidth = 3
        ctx.stroke()

        const headLength = 12
        const headAngle = Math.PI / 6
        const endX = userPosition.x + Math.cos(angle) * arrowLength
        const endY = userPosition.y + Math.sin(angle) * arrowLength

        ctx.beginPath()
        ctx.moveTo(endX, endY)
        ctx.lineTo(endX - headLength * Math.cos(angle - headAngle), endY - headLength * Math.sin(angle - headAngle))
        ctx.moveTo(endX, endY)
        ctx.lineTo(endX - headLength * Math.cos(angle + headAngle), endY - headLength * Math.sin(angle + headAngle))
        ctx.strokeStyle = "#fbbf24"
        ctx.lineWidth = 3
        ctx.stroke()
      }
    }

    users.forEach((user) => {
      const dx = user.x - userPosition.x
      const dy = user.y - userPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 120) {
        ctx.beginPath()
        ctx.moveTo(userPosition.x, userPosition.y)
        ctx.lineTo(user.x, user.y)
        const opacity = Math.max(0.1, 0.4 - distance / 300)
        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`
        ctx.lineWidth = 1
        ctx.setLineDash([3, 3])
        ctx.stroke()
        ctx.setLineDash([])
      }
    })

    ctx.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    if (viewMode === "compass") {
      renderCompass(ctx, canvas)
    } else {
      renderMap(ctx, canvas)
    }
  }, [users, userPosition, userGender, targetCoordinate, nearestUser, zoom, cameraOffset, viewMode, compassAngle, distanceToTarget])

  const handleCanvasInteraction = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in event) {
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    const screenX = clientX - rect.left
    const screenY = clientY - rect.top

    const worldX = (screenX - canvas.width / 2) / zoom - cameraOffset.x + canvas.width / 2
    const worldY = (screenY - canvas.height / 2) / zoom - cameraOffset.y + canvas.height / 2

    setUserPosition({ x: worldX, y: worldY })

    if (userGender && isConnected) {
      sendPosition(worldX, worldY, userGender)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }

  const handleResetView = () => {
    setZoom(1)
    setCameraOffset({ x: 0, y: 0 })
  }

  useEffect(() => {
    const animate = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (ctx) {
          canvas.style.transform = `translateZ(0)`
        }
      }
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  return (
    <div className="relative w-full h-screen bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-0 left-0 right-0 z-10 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-red-500" />
              )}
              <span className={`text-xs font-medium ${isConnected ? "text-emerald-600" : "text-red-600"}`}>
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
            <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
              <Users className="w-3 h-3 text-slate-600 dark:text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{users.length + 1}</span>
            </div>
            {targetProfile && (
              <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Target className="w-3 h-3 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">{targetProfile.name}</span>
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  {Math.round(distanceToTarget)}m
                </span>
              </div>
            )}
            {userLocation && (
              <div className="flex items-center space-x-2 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">GPS</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  ±{Math.round(userLocation.accuracy)}m
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleLeaderboard}
              className="h-8 px-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <Trophy className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Ranks</span>
            </Button>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onClick={handleCanvasInteraction}
        onTouchStart={handleCanvasInteraction}
      />

      <div className="absolute right-4 top-20 flex flex-col space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewMode(viewMode === "compass" ? "map" : "compass")}
          className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
        >
          {viewMode === "compass" ? (
            <Compass className="w-4 h-4" />
          ) : (
            <Map className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetView}
          className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800"
        >
          <Maximize2 className="w-3 h-3" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <p className="text-xs text-center text-slate-600 dark:text-slate-400 mb-2">
          {viewMode === "compass" 
            ? "Arrow points to your target • Follow the direction" 
            : "Tap to move • Find nearby explorers"
          }
        </p>
        {viewMode === "compass" ? (
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-slate-600 dark:text-slate-400">You</span>
            </div>
            <div className="flex items-center space-x-1">
              <Navigation className="w-3 h-3 text-amber-500" />
              <span className="text-slate-600 dark:text-slate-400">Target</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>
              <span className="text-slate-600 dark:text-slate-400">Distance</span>
            </div>
            {userLocation && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">GPS</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <span className="text-slate-600 dark:text-slate-400">You</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Guys</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-slate-600 dark:text-slate-400">Girls</span>
            </div>
            <div className="flex items-center space-x-1">
              <Navigation className="w-3 h-3 text-amber-500" />
              <span className="text-slate-600 dark:text-slate-400">Target</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-16 left-4 right-4 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>
        </div>
      )}

      {locationError && (
        <div className="absolute top-16 left-4 right-4 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-xs text-orange-600 dark:text-orange-400 text-center">{locationError}</p>
        </div>
      )}

      {targetError && (
        <div className="absolute top-16 left-4 right-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">{targetError}</p>
        </div>
      )}

      {isLoadingTarget && (
        <div className="absolute top-16 left-4 right-4 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center">Loading target...</p>
        </div>
      )}

      {!userLocation && !locationError && (
        <div className="absolute top-16 left-4 right-4 p-2 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">Requesting location permission...</p>
        </div>
      )}
    </div>
  )
}
