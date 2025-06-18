"use client"

import { cn } from "@/lib/utils";
import styles from "./time-indicator.module.css";
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react";

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
  startTrigger?: "load" | "interaction" | "fieldChange" | "manual" 
  dragBoundary?: number // pixels from screen edge (default: 20)
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
  startTrigger = "load", 
  dragBoundary = 20, // Default 20px from edges
}) => {
  const [timeRemaining, setTimeRemaining] = useState(maxTime)
  const [isActive, setIsActive] = useState(false)
  const [timerOffset, setTimerOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [hasExpired, setHasExpired] = useState(false) 

  const timerId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)
  const lastScrollY = useRef<number>(0)
  const scrollTimeout = useRef<number | null>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const hasFieldChanged = useRef<boolean>(false) 

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
    if (startTime.current === null && !hasExpired) {
      const elapsed = maxTime - timeRemaining
      startTime.current = Date.now() - elapsed * 1000
      setHasExpired(false) // Reset expired flag when starting
    }
    setIsActive(true)
  }, [timeRemaining, maxTime, hasExpired])

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
    setHasExpired(false) // Reset expired flag
    startTime.current = null
  }, [stopTimer, maxTime])

  // Improved clampToViewport with stricter boundaries
  const clampToViewport = useCallback(
    (x: number, y: number) => {
      if (!timerRef.current) return { x: 0, y: 0 }

      const timerRect = timerRef.current.getBoundingClientRect()
      const timerWidth = timerRect.width || 200 // Fallback width
      const timerHeight = timerRect.height || 80 // Fallback height

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Calculate boundaries with dragBoundary margin
      const minX = -(viewportWidth - timerWidth - dragBoundary)
      const maxX = viewportWidth - timerWidth - dragBoundary - 20 // 20 is the initial right offset
      const minY = -dragBoundary
      const maxY = viewportHeight - timerHeight - dragBoundary - 20 // 20 is the initial top offset

      return {
        x: Math.max(minX, Math.min(maxX, x)),
        y: Math.max(minY, Math.min(maxY, y)),
      }
    },
    [dragBoundary],
  )

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
  }, [timerPosition, clampToViewport])

  // Handle drag functionality with improved boundary checking
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

      // Apply clamping immediately during drag
      setTimerOffset(clampToViewport(newOffset.x, newOffset.y))
    },
    [isDragging, clampToViewport],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null

    // Final clamp on mouse up to ensure position is valid
    setTimerOffset((prev) => clampToViewport(prev.x, prev.y))
  }, [clampToViewport])

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
    setHasExpired(false)
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

  // Handle field change detection for startTrigger
  useEffect(() => {
    if (startTrigger !== "fieldChange") return

    const handleFieldChange = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.matches("input, textarea, select")) {
        if (!hasFieldChanged.current) {
          hasFieldChanged.current = true
          if (!isActive && !hasExpired) {
            startTimer()
          }
        }
      }
    }

    document.addEventListener("input", handleFieldChange)
    document.addEventListener("change", handleFieldChange)

    return () => {
      document.removeEventListener("input", handleFieldChange)
      document.removeEventListener("change", handleFieldChange)
    }
  }, [startTrigger, isActive, hasExpired, startTimer])

  // Handle different start triggers
  useEffect(() => {
    if (startTrigger === "load" && !isActive && !hasExpired) {
      // Start immediately on load
      startTimer()
      return
    }

    if (startTrigger === "interaction") {
      const handleInteraction = () => {
        if (!isActive && !hasExpired) {
          startTimer()
        }
      }

      document.addEventListener("mousedown", handleInteraction)
      document.addEventListener("keydown", handleInteraction)

      return () => {
        document.removeEventListener("mousedown", handleInteraction)
        document.removeEventListener("keydown", handleInteraction)
      }
    }
  }, [startTrigger, isActive, hasExpired, startTimer])

  // Timer logic with improved expiration handling
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
            // Timer expired
            setTimeRemaining(0)
            setIsWarning(false)
            setIsUrgent(false)
            stopTimer()

            // Only call onTimeExpired once
            if (!hasExpired) {
              setHasExpired(true)
              onTimeExpired?.()
            }
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
  }, [isActive, maxTime, onTimerUpdate, onTimeExpired, stopTimer, getEffectiveWarningThreshold, hasExpired])

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

  // Expose start/stop/reset functions for manual control
  const timerControls = {
    start: startTimer,
    stop: stopTimer,
    reset: resetTimer,
    isActive,
    timeRemaining,
    hasExpired,
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
            {(startTrigger === "manual" || manualStart) && !isActive && timeRemaining > 0 && !hasExpired && (
              <button
                onClick={startTimer}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              >
                Start
              </button>
            )}
          </div>
          <div className="text-xs opacity-75 mt-1 text-center">
            {hasExpired ? "Expired" : isWarning ? (isUrgent ? "URGENT!" : "Time running out!") : "Drag to move"}
          </div>
        </div>
      )}

      {showTimer && timerPosition === "inline" && (
        <div className={getTimerClasses("inline-block rounded-md px-2 py-1 text-sm font-medium shadow-sm mr-2 border")}>
          {formatTime(timeRemaining)}
          {timeRemaining === 0 && <span className="ml-1 text-xs">Time's Up!</span>}
          {(startTrigger === "manual" || manualStart) && !isActive && timeRemaining > 0 && !hasExpired && (
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
