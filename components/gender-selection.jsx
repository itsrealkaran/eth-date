"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Users, Heart, Sparkles } from "lucide-react"

export default function GenderSelection({ onGenderSelect }) {
  const [selectedGender, setSelectedGender] = useState(null)

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender)
    setTimeout(() => {
      onGenderSelect(gender)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Welcome to Rizzler
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Choose your gender to start exploring
          </p>
        </div>

        <div className="space-y-4">
          <Card 
            className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedGender === "male" 
                ? "ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            onClick={() => handleGenderSelect("male")}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Male
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connect with other guys
                </p>
              </div>
              {selectedGender === "male" && (
                <Sparkles className="w-5 h-5 text-indigo-500" />
              )}
            </div>
          </Card>

          <Card 
            className={`p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedGender === "female" 
                ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" 
                : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            onClick={() => handleGenderSelect("female")}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Female
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Connect with other girls
                </p>
              </div>
              {selectedGender === "female" && (
                <Sparkles className="w-5 h-5 text-emerald-500" />
              )}
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Your choice helps us match you with the right people
          </p>
        </div>
      </div>
    </div>
  )
}
