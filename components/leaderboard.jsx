"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Trophy, Users, Crown, TrendingUp, MapPin, Star, Zap } from "lucide-react"

export default function Leaderboard({ onClose, isVisible }) {
  const [activeTab, setActiveTab] = useState("male")
  const [animatedScores, setAnimatedScores] = useState({})

  const maleUsers = [
    {
      id: "1",
      name: "Alex Thunder",
      gender: "male",
      score: 2450,
      rank: 1,
      avatar: "👨‍💼",
      level: "Master Explorer",
      connections: 47,
      distance: 12.3,
      trend: "up",
    },
    {
      id: "2",
      name: "Jake Storm",
      gender: "male",
      score: 2200,
      rank: 2,
      avatar: "👨‍🎓",
      level: "Expert Navigator",
      connections: 39,
      distance: 8.7,
      trend: "up",
    },
    {
      id: "3",
      name: "Ryan Swift",
      gender: "male",
      score: 1980,
      rank: 3,
      avatar: "👨‍💻",
      level: "Pro Connector",
      connections: 34,
      distance: 15.2,
      trend: "same",
    },
    {
      id: "4",
      name: "Mike Flash",
      gender: "male",
      score: 1750,
      rank: 4,
      avatar: "👨‍🚀",
      level: "Advanced Scout",
      connections: 28,
      distance: 6.9,
      trend: "down",
    },
    {
      id: "5",
      name: "Tom Blaze",
      gender: "male",
      score: 1650,
      rank: 5,
      avatar: "👨‍🎨",
      level: "Skilled Wanderer",
      connections: 25,
      distance: 11.4,
      trend: "up",
    },
  ]

  const femaleUsers = [
    {
      id: "6",
      name: "Sarah Phoenix",
      gender: "female",
      score: 2650,
      rank: 1,
      avatar: "👩‍💼",
      level: "Elite Explorer",
      connections: 52,
      distance: 18.6,
      trend: "up",
    },
    {
      id: "7",
      name: "Emma Nova",
      gender: "female",
      score: 2400,
      rank: 2,
      avatar: "👩‍🎓",
      level: "Master Navigator",
      connections: 44,
      distance: 14.2,
      trend: "up",
    },
    {
      id: "8",
      name: "Mia Spark",
      gender: "female",
      score: 2100,
      rank: 3,
      avatar: "👩‍💻",
      level: "Expert Connector",
      connections: 38,
      distance: 9.8,
      trend: "same",
    },
    {
      id: "9",
      name: "Luna Bright",
      gender: "female",
      score: 1900,
      rank: 4,
      avatar: "👩‍🚀",
      level: "Pro Scout",
      connections: 31,
      distance: 13.5,
      trend: "up",
    },
    {
      id: "10",
      name: "Zoe Flash",
      gender: "female",
      score: 1800,
      rank: 5,
      avatar: "👩‍🎨",
      level: "Advanced Explorer",
      connections: 29,
      distance: 7.3,
      trend: "down",
    },
  ]

  const currentUsers = activeTab === "male" ? maleUsers : femaleUsers

  useEffect(() => {
    if (isVisible) {
      const scores = {}
      currentUsers.forEach((user) => {
        scores[user.id] = 0
      })
      setAnimatedScores(scores)

      // Animate scores up
      const timer = setTimeout(() => {
        const finalScores = {}
        currentUsers.forEach((user) => {
          finalScores[user.id] = user.score
        })
        setAnimatedScores(finalScores)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [isVisible, activeTab, currentUsers])

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />
      case "down":
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />
    }
  }

  const getRankStyling = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm">
      <div className="mobile-container h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Leaderboard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-500">Weekly rankings</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex p-4 space-x-2">
          <Button
            variant={activeTab === "male" ? "default" : "ghost"}
            className={`flex-1 h-10 rounded-xl transition-all duration-200 ${
              activeTab === "male"
                ? "bg-indigo-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
            onClick={() => setActiveTab("male")}
          >
            <Users className="w-4 h-4 mr-2" />
            Guys ({maleUsers.length})
          </Button>
          <Button
            variant={activeTab === "female" ? "default" : "ghost"}
            className={`flex-1 h-10 rounded-xl transition-all duration-200 ${
              activeTab === "female"
                ? "bg-emerald-500 text-white shadow-lg"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
            onClick={() => setActiveTab("female")}
          >
            <Users className="w-4 h-4 mr-2" />
            Girls ({femaleUsers.length})
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentUsers.map((user, index) => (
            <Card
              key={user.id}
              className="p-4 transition-all duration-300 hover:shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 rounded-xl"
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white ${
                      user.gender === "male"
                        ? "bg-gradient-to-br from-indigo-500 to-blue-600"
                        : "bg-gradient-to-br from-emerald-500 to-teal-600"
                    }`}
                  >
                    {user.name.charAt(0)}
                  </div>
                  {user.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      user.rank === 1
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : user.rank === 2
                          ? "bg-gradient-to-br from-slate-400 to-slate-600"
                          : user.rank === 3
                            ? "bg-gradient-to-br from-amber-600 to-amber-800"
                            : "bg-slate-400"
                    }`}
                  >
                    {user.rank}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</h3>
                      {getTrendIcon(user.trend)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {(animatedScores[user.id] || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">{user.level}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{user.connections}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{user.distance}km</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-500">Total</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {maleUsers.length + femaleUsers.length}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Active</p>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {Math.floor((maleUsers.length + femaleUsers.length) * 0.7)}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <p className="text-xs text-amber-600 dark:text-amber-400">Top Score</p>
              <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                {Math.max(...currentUsers.map((u) => u.score)).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
