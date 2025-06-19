"use client"

import { cn } from "@/lib/utils";
import styles from "./time-indicator.module.css";
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react";

interface FormGuardWrapperProps {
  children: React.ReactNode
  onTimerUpdate?: (seconds: number) => void
  onTimeExpired?: () => Promise<void> | void 
  onCopyPasteAttempt?: (type: "copy" | "cut" | "paste") => void
  onServerError?: (error: Error, retryCount: number) => void
  onRetrySuccess?: () => void
  showTimer?: boolean
  timerPosition?: "top-right" | "inline" | "floating"
  maxTime?: number
  manualStart?: boolean
  warningThreshold?: number
  warningType?: "percentage" | "seconds"
  startTrigger?: "load" | "interaction" | "fieldChange" | "manual"
  dragBoundary?: number
  retryAttempts?: number // How many times to retry server call
  retryDelay?: number // Delay between retries in ms
  gracePeriod?: number // Extra time given when server fails (seconds)
  fallbackAction?: () => void // What to do if all retries fail
}

type TimerState = "active" | "expired" | "retrying" | "failed" | "grace-period"

const FormGuardWrapper: React.FC<FormGuardWrapperProps> = ({
  children,
  onTimerUpdate,
  onCopyPasteAttempt,
  onTimeExpired,
  onServerError,
  onRetrySuccess,
  showTimer = false,
  timerPosition = "top-right",
  maxTime = 60,
  manualStart = false,
  warningThreshold = 30,
  warningType = "seconds",
  startTrigger = "interaction",
  dragBoundary = 20,
  retryAttempts = 3,
  retryDelay = 2000,
  gracePeriod = 60, // seconds
  fallbackAction,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(maxTime)
  const [isActive, setIsActive] = useState(false)
  const [timerOffset, setTimerOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isWarning, setIsWarning] = useState(false)
  const [isUrgent, setIsUrgent] = useState(false)
  const [timerState, setTimerState] = useState<TimerState>("active")
  const [retryCount, setRetryCount] = useState(0)
  const [gracePeriodRemaining, setGracePeriodRemaining] = useState(0)

  const timerId = useRef<number | null>(null)
  const startTime = useRef<number | null>(null)
  const lastScrollY = useRef<number>(0)
  const scrollTimeout = useRef<number | null>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number } | null>(null)
  const hasFieldChanged = useRef<boolean>(false)
  const retryTimeoutId = useRef<number | null>(null)
  const gracePeriodTimeoutId = useRef<number | null>(null)

  // Calculate effective warning threshold
  const getEffectiveWarningThreshold = useCallback(() => {
    if (warningType === "percentage") {
      const thresholdInSeconds = Math.ceil((warningThreshold / 100) * maxTime)
      return Math.min(thresholdInSeconds, maxTime)
    } else {
      return Math.min(warningThreshold, maxTime)
    }
  }, [warningThreshold, warningType, maxTime])

  const startTimer = useCallback(() => {
    if (startTime.current === null && timerState === "active") {
      const elapsed = maxTime - timeRemaining
      startTime.current = Date.now() - elapsed * 1000
      setTimerState("active")
    }
    setIsActive(true)
  }, [timeRemaining, maxTime, timerState])

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
    setTimerState("active")
    setRetryCount(0)
    setGracePeriodRemaining(0)
    startTime.current = null

    // Clear any pending timeouts
    if (retryTimeoutId.current) {
      clearTimeout(retryTimeoutId.current)
      retryTimeoutId.current = null
    }
    if (gracePeriodTimeoutId.current) {
      clearTimeout(gracePeriodTimeoutId.current)
      gracePeriodTimeoutId.current = null
    }
  }, [stopTimer, maxTime])

  // Handle server call with retry logic
  const handleServerCall = useCallback(async () => {
    if (!onTimeExpired) return

    try {
      setTimerState("retrying")
      await onTimeExpired()

      // Success
      setTimerState("expired")
      onRetrySuccess?.()
    } catch (error) {
      const currentRetry = retryCount + 1
      setRetryCount(currentRetry)

      onServerError?.(error as Error, currentRetry)

      if (currentRetry < retryAttempts) {
        // Schedule retry
        retryTimeoutId.current = window.setTimeout(() => {
          handleServerCall()
        }, retryDelay)
      } else {
        // All retries failed
        if (gracePeriod > 0) {
          // Enter grace period
          setTimerState("grace-period")
          setGracePeriodRemaining(gracePeriod)

          // Start grace period countdown
          const graceStartTime = Date.now()
          const graceInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - graceStartTime) / 1000)
            const remaining = gracePeriod - elapsed

            if (remaining > 0) {
              setGracePeriodRemaining(remaining)
            } else {
              clearInterval(graceInterval)
              setTimerState("failed")
              fallbackAction?.()
            }
          }, 1000)

          gracePeriodTimeoutId.current = window.setTimeout(() => {
            clearInterval(graceInterval)
            setTimerState("failed")
            fallbackAction?.()
          }, gracePeriod * 1000)
        } else {
          // No grace period, fail immediately
          setTimerState("failed")
          fallbackAction?.()
        }
      }
    }
  }, [onTimeExpired, retryCount, retryAttempts, retryDelay, gracePeriod, onServerError, onRetrySuccess, fallbackAction])

  // Manual retry function
  const manualRetry = useCallback(() => {
    setRetryCount(0)
    handleServerCall()
  }, [handleServerCall])

  // Improved clampToViewport
  const clampToViewport = useCallback(
    (x: number, y: number) => {
      if (!timerRef.current) return { x: 0, y: 0 }

      const timerRect = timerRef.current.getBoundingClientRect()
      const timerWidth = timerRect.width || 200
      const timerHeight = timerRect.height || 80

      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      const minX = -(viewportWidth - timerWidth - dragBoundary)
      const maxX = viewportWidth - timerWidth - dragBoundary - 20
      const minY = -dragBoundary
      const maxY = viewportHeight - timerHeight - dragBoundary - 20

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
    [isDragging, clampToViewport],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStart.current = null
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
    setTimerState("active")
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

  // Handle field change detection
  useEffect(() => {
    if (startTrigger !== "fieldChange") return

    const handleFieldChange = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.matches("input, textarea, select")) {
        if (!hasFieldChanged.current) {
          hasFieldChanged.current = true
          if (!isActive && timerState === "active") {
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
  }, [startTrigger, isActive, timerState, startTimer])

  // Handle different start triggers
  useEffect(() => {
    if (startTrigger === "load" && !isActive && timerState === "active") {
      startTimer()
      return
    }

    if (startTrigger === "interaction") {
      const handleInteraction = () => {
        if (!isActive && timerState === "active") {
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
  }, [startTrigger, isActive, timerState, startTimer])

  // Main timer logic
  useEffect(() => {
    if (isActive && timerState === "active") {
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

            // Attempt server call with retry logic
            handleServerCall()
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
  }, [isActive, timerState, maxTime, onTimerUpdate, stopTimer, getEffectiveWarningThreshold, handleServerCall])

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, "0")
    const remainingSeconds = (timeInSeconds % 60).toString().padStart(2, "0")
    return `${minutes}:${remainingSeconds}`
  }

  // Get timer classes based on state
  const getTimerClasses = (baseClasses: string) => {
    if (timerState === "retrying") {
      return cn(baseClasses, "bg-yellow-500 text-white border-yellow-600")
    } else if (timerState === "grace-period") {
      return cn(baseClasses, "bg-orange-500 text-white border-orange-600")
    } else if (timerState === "failed") {
      return cn(baseClasses, "bg-red-600 text-white border-red-700")
    } else if (isWarning) {
      return cn(baseClasses, styles.warningState)
    } else {
      const percentage = (timeRemaining / maxTime) * 100
      if (percentage <= 10) return cn(baseClasses, styles.redState)
      else if (percentage <= 25) return cn(baseClasses, styles.orangeState)
      else return cn(baseClasses, styles.normalState)
    }
  }

  const getDotClasses = () => {
    if (timerState === "retrying") {
      return "w-2 h-2 rounded-full bg-yellow-200 animate-spin"
    } else if (timerState === "grace-period") {
      return "w-2 h-2 rounded-full bg-orange-200 animate-pulse"
    } else if (timerState === "failed") {
      return "w-2 h-2 rounded-full bg-red-200"
    } else if (isWarning) {
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
      timerState === "retrying" && "bg-yellow-500 text-white border-yellow-600",
      timerState === "grace-period" && "bg-orange-500 text-white border-orange-600",
      timerState === "failed" && "bg-red-600 text-white border-red-700",
      timerState === "active" && isWarning && styles.warningState,
      timerState === "active" && !isWarning && styles.normalState,
      isUrgent ? styles.urgentBreathingAnimation : isWarning ? styles.breathingAnimation : "",
    )
  }

  const getStatusText = () => {
    switch (timerState) {
      case "retrying":
        return `Retrying... (${retryCount}/${retryAttempts})`
      case "grace-period":
        return `Grace period: ${formatTime(gracePeriodRemaining)}`
      case "failed":
        return "Connection failed"
      case "expired":
        return "Time's up!"
      default:
        return isWarning ? (isUrgent ? "URGENT!" : "Time running out!") : "Drag to move"
    }
  }

  return (
    <div className="relative">
      {showTimer && timerPosition === "top-right" && (
        <div
          className={getTimerClasses(
            "absolute top-2 right-2 rounded-md px-2 py-1 text-sm font-medium shadow-md z-10 border",
          )}
        >
          {timerState === "grace-period" ? formatTime(gracePeriodRemaining) : formatTime(timeRemaining)}
          {timerState === "expired" && <span className="ml-1 text-xs">Time's Up!</span>}
        </div>
      )}

      {showTimer && timerPosition === "floating" && (
        <div ref={timerRef} className={getFloatingTimerClasses()} style={getTimerStyle()} onMouseDown={handleMouseDown}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className={getDotClasses()} />
              {timerState === "grace-period" ? formatTime(gracePeriodRemaining) : formatTime(timeRemaining)}
            </div>
            {timerState === "expired" && <span className="text-xs font-bold">Time's Up!</span>}
            {timerState === "retrying" && <span className="text-xs font-bold">🔄</span>}
            {timerState === "grace-period" && <span className="text-xs font-bold">⏳</span>}
            {timerState === "failed" && (
              <button
                onClick={manualRetry}
                className="px-2 py-1 bg-white text-red-600 rounded text-xs hover:bg-gray-100 transition-colors"
              >
                Retry
              </button>
            )}
            {isWarning && timerState === "active" && (
              <span className={cn("text-xs font-bold", styles.bounceIcon)}>⚠️</span>
            )}
            {(startTrigger === "manual" || manualStart) && !isActive && timerState === "active" && (
              <button
                onClick={startTimer}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
              >
                Start
              </button>
            )}
          </div>
          <div className="text-xs opacity-75 mt-1 text-center">{getStatusText()}</div>
        </div>
      )}

      {showTimer && timerPosition === "inline" && (
        <div className={getTimerClasses("inline-block rounded-md px-2 py-1 text-sm font-medium shadow-sm mr-2 border")}>
          {timerState === "grace-period" ? formatTime(gracePeriodRemaining) : formatTime(timeRemaining)}
          {timerState === "expired" && <span className="ml-1 text-xs">Time's Up!</span>}
          {(startTrigger === "manual" || manualStart) && !isActive && timerState === "active" && (
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
