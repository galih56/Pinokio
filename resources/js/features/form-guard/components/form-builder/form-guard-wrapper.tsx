"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

interface FormGuardWrapperProps {
  children: React.ReactNode
  onTimerUpdate?: (seconds: number) => void
  onCopyPasteAttempt?: (type: "copy" | "cut" | "paste") => void
  showTimer?: boolean
  timerPosition?: "top-right" | "inline"
  maxTime?: number
  manualStart?: boolean
}

const FormGuardWrapper: React.FC<FormGuardWrapperProps> = ({
  children,
  onTimerUpdate,
  onCopyPasteAttempt,
  showTimer = false,
  timerPosition = "top-right",
  maxTime = 60,
  manualStart = false,
}) => {
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const timerId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)

  const startTimer = useCallback(() => {
    if (startTime.current === null) {
      startTime.current = Date.now() - seconds * 1000
    }
    setIsActive(true)
  }, [seconds])

  const stopTimer = useCallback(() => {
    setIsActive(false)
    if (timerId.current) {
      window.clearInterval(timerId.current)
      timerId.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    stopTimer()
    setSeconds(0)
    startTime.current = null
  }, [stopTimer])

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      onCopyPasteAttempt?.("copy")
    }

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      onCopyPasteAttempt?.("cut")
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      onCopyPasteAttempt?.("paste")
    }

    document.addEventListener("copy", handleCopy)
    document.addEventListener("cut", handleCut)
    document.addEventListener("paste", handlePaste)

    return () => {
      document.removeEventListener("copy", handleCopy)
      document.removeEventListener("cut", handleCut)
      document.removeEventListener("paste", handlePaste)
      stopTimer()
    }
  }, [onCopyPasteAttempt, stopTimer])

  useEffect(() => {
    if (manualStart) {
      return
    }

    const handleInteraction = () => {
      if (!isActive) {
        startTimer()
      }
    }

    document.addEventListener("mousedown", handleInteraction)
    document.addEventListener("keydown", handleInteraction)

    return () => {
      document.removeEventListener("mousedown", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }
  }, [isActive, manualStart, startTimer])

  useEffect(() => {
    if (isActive) {
      timerId.current = window.setInterval(() => {
        if (startTime.current !== null) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
          if (elapsed <= maxTime) {
            setSeconds(elapsed)
            onTimerUpdate?.(elapsed)
          } else {
            stopTimer()
          }
        }
      }, 1000)
    } else if (!isActive && timerId.current) {
      window.clearInterval(timerId.current)
      timerId.current = null
    }

    return () => {
      if (timerId.current) {
        window.clearInterval(timerId.current)
      }
    }
  }, [isActive, maxTime, onTimerUpdate, stopTimer])

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0")
    const remainingSeconds = (timeInSeconds % 60).toString().padStart(2, "0")
    return `${minutes}:${remainingSeconds}`
  }

  return (
    <div className="relative">
      {showTimer && timerPosition === "top-right" && (
        <div className="absolute top-2 right-2 bg-white text-gray-800 rounded-md px-2 py-1 text-sm font-medium shadow-md z-10">
          {formatTime(seconds)}
        </div>
      )}
      {showTimer && timerPosition === "inline" && (
        <div className="inline-block bg-white text-gray-800 rounded-md px-2 py-1 text-sm font-medium shadow-sm mr-2">
          {formatTime(seconds)}
          {manualStart && !isActive && (
            <button onClick={startTimer} className="ml-2 px-2 py-1 bg-blue-500 text-white rounded-md text-xs">
              Start
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default FormGuardWrapper
