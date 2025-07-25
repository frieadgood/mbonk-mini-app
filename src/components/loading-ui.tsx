"use client"

import { useEffect, useState } from "react"

interface LoadingUIProps {
  message?: string
  size?: "sm" | "md" | "lg"
  className?: string
  logo?: React.ReactNode
}

export default function LoadingUI({ 
  message = "Loading...", 
  size = "md",
  className = "",
  logo
}: LoadingUIProps) {
  const [currentChar, setCurrentChar] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChar(prev => (prev + 1) % message.length)
    }, 150)
    return () => clearInterval(interval)
  }, [message])

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg"
  }

  return (
    <div className={`container mx-auto px-4 py-4 pb-20 flex items-center justify-center min-h-[60vh] ${className}`}>
      <div className="text-center space-y-4">
        {/* Project Logo */}
        <div className="flex justify-center">
          {logo || (
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white">MC</span>
            </div>
          )}
        </div>

        {/* Tech + DeFi Loading Text */}
        <div className="space-y-4">
          {/* Animated loading text */}
          <div className={`${sizeClasses[size]} font-mono text-center`}>
            <span className="text-gray-400">[</span>
            <span className="text-blue-400 font-bold">
              {message.split('').map((char, index) => (
                <span
                  key={index}
                  className={`transition-all duration-200 ${
                    index === currentChar 
                      ? 'text-purple-400 scale-110' 
                      : index < currentChar 
                        ? 'text-blue-400' 
                        : 'text-gray-500'
                  }`}
                >
                  {char}
                </span>
              ))}
            </span>
            <span className="text-gray-400">]</span>
          </div>
        </div>
      </div>
    </div>
  )
} 