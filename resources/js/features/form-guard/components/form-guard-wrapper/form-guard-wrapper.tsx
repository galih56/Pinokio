"use client"

import { cn } from "@/lib/utils";
import styles from "./time-indicator.module.css";
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"

interface FormGuardWrapperProps {
  children: React.ReactNode
  onTimerUpdate?: (seconds: number) => void
  onTimeExpired?: () => void
  onCopyPasteAttempt?: (type: "copy" | "cut" | "paste") => void
  showTimer?: boolean
  timerPosition?: "top-right" | "inline" | "floating"
  maxTime?: number
  manualStart?: boolean
  warningThreshold?: number
  warningType?: "percentage" | "seconds"
}

const FormGuardWrapper: React.FC<FormGuardWrapperProps> = ({
  children,
  onTimerUpdate,
  onCopyPasteAttempt,
  onTimeExpired,
  showTimer = false,
  timerPosition = "top-right",
  maxTime = 60,
  manualStart = false,
  warningThreshold = 10,
  warningType = "seconds",
}) => {
  const [timeRemaining, setTimeRemaining] = useState(maxTime)
  const [isActive, setIsActive] = useState(false)
  const [timerOffset, setTimerOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)

  const timerId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)
  const lastScrollY = useRef<number>(0)
  const scrollTimeout = useRef<number | null>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)

  // Calculate effective warning threshold to handle edge cases
  const getEffectiveWarningThreshold = useCallback(() => {
    if (warningType === "percentage") {
      const thresholdInSeconds = Math.ceil((warningThreshold / 100) * maxTime)
      return Math.min(thresholdInSeconds, maxTime)
    } else {
      return Math.min(warningThreshold, maxTime)
    }
  }, [warningThreshold, warningType, maxTime])

  const startTimer = useCallback(() => {
    if (startTime.current === null) {
      const elapsed = maxTime - timeRemaining
      startTime.current = Date.now() - elapsed * 1000
    }
    setIsActive(true)
  }, [timeRemaining, maxTime])

  const stopTimer = useCallback(() => {
    setIsActive(false)
    if (timerId.current) {
      window.clearInterval(timerId.current)
      timerId.current = null
    }
  }, [])

  const resetTimer = useCallback(() => {
    stopTimer()
    setTimeRemaining(maxTime)
    startTime.current = null
  }, [stopTimer, maxTime])

  const clampToViewport = (x: number, y: number) => {
    const timerWidth = 200
    const timerHeight = 80
    const margin = 10

    const maxX = window.innerWidth - timerWidth - margin
    const maxY = window.innerHeight - timerHeight - margin

    return {
      x: Math.max(-window.innerWidth + timerWidth + margin, Math.min(maxX - 20, x)),
      y: Math.max(-margin, Math.min(maxY - 20, y)),
    }
  }

  const getTimerStyle = (): React.CSSProperties => {
    if (timerPosition === "floating") {
      const clampedOffset = clampToViewport(timerOffset.x, timerOffset.y)
      return {
        top: `${20 + clampedOffset.y}px`,
        right: `${20 - clampedOffset.x}px`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
      }
    }
    return {}
  }

  // Handle scroll following behavior
  useEffect(() => {
    if (timerPosition !== "floating") return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY.current

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      setTimerOffset((prev) => {
        const newOffset = {
          x: prev.x,
          y: prev.y + scrollDelta * 0.3,
        }
        return clampToViewport(newOffset.x, newOffset.y)
      })

      scrollTimeout.current = window.setTimeout(() => {
        setTimerOffset((prev) => {
          const newOffset = {
            x: prev.x,
            y: prev.y * 0.8,
          }
          return clampToViewport(newOffset.x, newOffset.y)
        })
      }, 150)

      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [timerPosition])

  // Handle drag functionality
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (timerPosition !== "floating") return

      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - timerOffset.x,
        y: e.clientY - timerOffset.y,
      }
      e.preventDefault()
    },
    [timerPosition, timerOffset],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStart.current) return

      const newOffset = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      }
      setTimerOffset(clampToViewport(newOffset.x, newOffset.y))
    },
    [isDragging],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Reset timer when maxTime changes
  useEffect(() => {
    setTimeRemaining(maxTime)
  }, [maxTime])

  // Copy/paste prevention
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

  // Auto-start timer on interaction
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

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerId.current = window.setInterval(() => {
        if (startTime.current !== null) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000)
          const remaining = maxTime - elapsed

          if (remaining >= 0) {
            setTimeRemaining(remaining)

            const effectiveThreshold = getEffectiveWarningThreshold()
            const shouldWarn = remaining <= effectiveThreshold
            const shouldBeUrgent = remaining <= Math.min(5, effectiveThreshold / 2)

            setIsWarning(shouldWarn)
            setIsUrgent(shouldBeUrgent && shouldWarn)

            onTimerUpdate?.(remaining)
          } else {
            setTimeRemaining(0)
            setIsWarning(false)
            setIsUrgent(false)
            stopTimer()
            onTimeExpired?.()
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
  }, [isActive, maxTime, onTimerUpdate, onTimeExpired, stopTimer, getEffectiveWarningThreshold])

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0")
    const remainingSeconds = (timeInSeconds % 60).toString().padStart(2, "0")
    return `${minutes}:${remainingSeconds}`
  }

  // Get timer classes using cn function
  const getTimerClasses = (baseClasses: string) => {
    if (isWarning) {
      return cn(baseClasses, styles.warningState)
    } else {
      const percentage = (timeRemaining / maxTime) * 100
      if (percentage <= 10) return cn(baseClasses, styles.redState)
      else if (percentage <= 25) return cn(baseClasses, styles.orangeState)
      else return cn(baseClasses, styles.normalState)
    }
  }

  const getDotClasses = () => {
    if (isWarning) {
      return cn("w-2 h-2 rounded-full", styles.warningDot)
    } else if (timeRemaining > 0) {
      return cn("w-2 h-2 rounded-full", styles.pulsingDot)
    } else {
      return cn("w-2 h-2 rounded-full", styles.expiredDot)
    }
  }

  const getFloatingTimerClasses = () => {
    return cn(
      styles.floatingTimer,
      isDragging ? styles.dragging : styles.notDragging,
      isWarning && styles.warningState,
      !isWarning && styles.normalState,
      isUrgent ? styles.urgentBreathingAnimation : isWarning ? styles.breathingAnimation : "",
    )
  }

  return (
    <div className="relative">
      {showTimer && timerPosition === "top-right" && (
        <div
          className={getTimerClasses(
            "absolute top-2 right-2 rounded-md px-2 py-1 text-sm font-medium shadow-md z-10 border",
          )}
        >
          {formatTime(timeRemaining)}
          {timeRemaining === 0 && <span className="ml-1 text-xs">Time's Up!</span>}
        </div>
      )}

      {showTimer && timerPosition === "floating" && (
        <div ref={timerRef} className={getFloatingTimerClasses()} style={getTimerStyle()} onMouseDown={handleMouseDown}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={getDotClasses()} />
              {formatTime(timeRemaining)}
            </div>
            {timeRemaining === 0 && <span className="text-xs font-bold">Time's Up!</span>}
            {isWarning && timeRemaining > 0 && <span className={cn("text-xs font-bold", styles.bounceIcon)}>⚠️</span>}
            {manualStart && !isActive && timeRemaining > 0 && (
              <button
                onClick={startTimer}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              >
                Start
              </button>
            )}
          </div>
          <div className="text-xs opacity-75 mt-1 text-center">
            {isWarning ? (isUrgent ? "URGENT!" : "Time running out!") : "Drag to move"}
          </div>
        </div>
      )}

      {showTimer && timerPosition === "inline" && (
        <div className={getTimerClasses("inline-block rounded-md px-2 py-1 text-sm font-medium shadow-sm mr-2 border")}>
          {formatTime(timeRemaining)}
          {timeRemaining === 0 && <span className="ml-1 text-xs">Time's Up!</span>}
          {manualStart && !isActive && timeRemaining > 0 && (
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
