"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import {
  ArrowRight, Play, Pause, Download, Upload, Sparkles, Clock, Share2, Mic, Settings, X, ChevronDown, Star, Zap, CheckCircle, Crown, Menu, Shield, Users, BarChart3, Palette, Music, RefreshCw, Wand2, Video, FileVideo, Globe, Smartphone, LayoutGrid, ChevronRight, ChevronUp, Info, User, Film
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect, useRef } from "react"
import SubscriptionModal from "@/components/subscription-modal"
import { useRouter } from "next/navigation"
import Image from "next/image"
import AIBackground from "@/components/ai-background"
import Link from "next/link"
import { cn } from "@/lib/utils"
import MusicSelector from "@/components/music-selector"


// Declare YouTube Player API types
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// Music option type
interface MusicOption {
  id: string
  name: string
  duration: string
  file: string
}

// User settings type
interface UserSettings {
  clipLength: string
  selectedTemplate: string
  musicEnabled: boolean
  musicSelection: "random" | "select"
  selectedMusic: MusicOption | null
  memeHook: boolean
  gameVideo: boolean
  hookTitle: boolean
  callToAction: boolean
  backgroundMusic: boolean
  layout: string
}

export default function Home() {
  const router = useRouter()
  const { user, login, isAuthenticated } = useAuth()

  // Helper function to check if user has Expert Mode
  const isExpertUser = () => {
    return user?.subscription?.plan === "expert" && user?.email === "expert@example.com"
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [activeSection, setActiveSection] = useState("hero")
  const [scrolled, setScrolled] = useState(false)
  const [timeRange, setTimeRange] = useState([0, 0]) // Will be updated with actual video duration
  const [videoDuration, setVideoDuration] = useState(3600) // Default max duration
  const [clipLength, setClipLength] = useState("30s-60s")
  const [selectedTemplate, setSelectedTemplate] = useState("hormozi1")
  const [videoCurrentTime, setVideoCurrentTime] = useState(0)
  const [isDraggingStartSlider, setIsDraggingStartSlider] = useState(false)
  const [isDraggingEndSlider, setIsDraggingEndSlider] = useState(false)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  const [musicEnabled, setMusicEnabled] = useState(false)
  const [musicSelection, setMusicSelection] = useState<"random" | "select">("random")
  const [selectedMusic, setSelectedMusic] = useState<MusicOption | null>(null)
  const [memeHook, setMemeHook] = useState(false)
  const [gameVideo, setGameVideo] = useState(false)
  const [hookTitle, setHookTitle] = useState(false)
  const [callToAction, setCallToAction] = useState(false)
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  const [layout, setLayout] = useState("auto")

  const videoRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<any>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)
  const previousTimeRangeRef = useRef(timeRange)
  const ytApiLoadedRef = useRef(false)

  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null)
  const howItWorksRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Function to extract video ID from YouTube URL
  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const videoId = getYoutubeVideoId(youtubeUrl)

  const handlePreview = () => {
    if (youtubeUrl) {
      setShowPreview(true)
    }
  }

  const handleStartGeneration = () => {
    if (isAuthenticated) {
      // Save user settings
      saveUserSettings()
      // Show subscription modal
      setShowSubscriptionModal(true)
    } else {
      // Save video URL and settings before redirecting to auth
      saveUserSettings()
      if (youtubeUrl) {
        localStorage.setItem("pendingVideoUrl", youtubeUrl)
        localStorage.setItem("pendingTimeRange", JSON.stringify(timeRange))
      }
      router.push("/auth")
    }
  }

  // Format seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  // Get minimum and maximum gap based on selected clip length
  const getClipLengthConstraints = () => {
    let minGap, maxGap

    // Set constraints based on selected clip length
    switch (clipLength) {
      case "<30s":
        minGap = 10
        maxGap = 30// 10 minutes
        break
      case "30s-60s":
        minGap = 30
        maxGap = 60 // 10 minutes
        break
      case "60s-90s":
        minGap = 60
        maxGap = 90// 10 minutes
        break
      case "original":
        minGap = 300 // 5 minutes
        maxGap = 600 // 10 minutes
        break
      default:
        minGap = 30
        maxGap = 600 // Default to 10 minutes
    }

    return { minGap, maxGap }
  }

  // Custom slider handlers to detect which handle is being dragged
  const handleSliderMouseDown = (e: any) => {
    const sliderRect = (e.target as HTMLElement).getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
    const clickX = clientX - sliderRect.left
    const sliderWidth = sliderRect.width

    const startHandlePos = (timeRange[0] / videoDuration) * sliderWidth
    const endHandlePos = (timeRange[1] / videoDuration) * sliderWidth

    const distToStart = Math.abs(clickX - startHandlePos)
    const distToEnd = Math.abs(clickX - endHandlePos)

    const isStart = distToStart <= distToEnd
    setIsDraggingStartSlider(isStart)
    setIsDraggingEndSlider(!isStart)
    console.log("Mouse down - dragging start handle:", isStart)
  }

  const handleSliderMouseUp = () => {
    setIsDraggingStartSlider(false)
    setIsDraggingEndSlider(false)
    console.log("Mouse up on slider")
  }

  const handleTimeRangeChange = (newValues: number[]) => {
    const { minGap, maxGap } = getClipLengthConstraints()
    const prevStart = previousTimeRangeRef.current[0]
    const prevEnd = previousTimeRangeRef.current[1]
    const newStart = newValues[0]
    const newEnd = newValues[1]
    const currentGap = prevEnd - prevStart
    const newGap = newEnd - newStart

    // Debug logging
    console.log({
      isDraggingStartSlider,
      isDraggingEndSlider,
      newValues,
      prevStart,
      prevEnd,
      currentGap,
      newGap
    })

    const isGapMin = Math.abs(currentGap - minGap) < 0.1
    const isGapMax = Math.abs(currentGap - maxGap) < 0.1
    
    // Detect gap dragging - when both handles move together
    const startMove = newStart - prevStart
    const endMove = newEnd - prevEnd
    const isGapDragging = Math.abs(startMove - endMove) < 1.0 && (Math.abs(startMove) > 0.1 || Math.abs(endMove) > 0.1)
    
    // Check if we should move the gap as a whole when at min/max constraints
    const shouldMoveGap = (isGapMin || isGapMax) && (isDraggingStartSlider || isDraggingEndSlider)
    
    let finalValues = [...newValues]

    // Handle gap movement (either true gap dragging or constraint-based movement)
    if (isGapDragging || shouldMoveGap) {
      const gapSize = prevEnd - prevStart
      let moveAmount = 0
      
      if (isGapDragging) {
        // Use average movement for true gap dragging
        moveAmount = (startMove + endMove) / 2
      } else if (shouldMoveGap) {
        // Use individual handle movement when constrained
        moveAmount = isDraggingStartSlider ? startMove : endMove
      }
      
      let newStartPos = prevStart + moveAmount
      let newEndPos = prevEnd + moveAmount
      
      // Constrain to video boundaries while maintaining gap
      if (newStartPos < 0) {
        newStartPos = 0
        newEndPos = newStartPos + gapSize
      } else if (newEndPos > videoDuration) {
        newEndPos = videoDuration
        newStartPos = newEndPos - gapSize
      }
      
      // Ensure final positions are valid
      if (newStartPos >= 0 && newEndPos <= videoDuration && newStartPos < newEndPos) {
        finalValues = [newStartPos, newEndPos]
      } else {
        finalValues = [prevStart, prevEnd]
      }
    } else {
      if (newGap < minGap) {
        finalValues = isDraggingStartSlider
          ? [Math.min(newStart, newEnd - minGap), newEnd]
          : [newStart, Math.max(newEnd, newStart + minGap)]
      } else if (newGap > maxGap) {
        finalValues = isDraggingStartSlider
          ? [Math.max(newStart, newEnd - maxGap), newEnd]
          : [newStart, Math.min(newEnd, newStart + maxGap)]
      } else {
        finalValues = [newStart, newEnd]
      }
    }

    // ✅ DO NOT TOUCH THIS BLOCK
    setTimeRange(finalValues)
    previousTimeRangeRef.current = finalValues

    if (finalValues[0] !== prevStart && playerRef.current && isPlayerReady) {
      try {
        playerRef.current.seekTo(finalValues[0], true)
        const state = playerRef.current.getPlayerState()
        if (isDraggingStartSlider || state !== 1) {
          playerRef.current.playVideo()
        }
      } catch (e) {
        console.error("Failed to seek:", e)
      }
    }
  }

  // Update time range when clip length changes
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return

    // Get the current start time
    const currentStart = timeRange[0]

    // Get the constraints based on selected clip length
    const { minGap, maxGap } = getClipLengthConstraints()

    // Calculate new end time based on min gap
    const newEnd = Math.min(currentStart + minGap, videoDuration)

    // Update time range
    setTimeRange([currentStart, newEnd])
    previousTimeRangeRef.current = [currentStart, newEnd]
  }, [clipLength, isPlayerReady])

  // Initialize YouTube player
  useEffect(() => {
    if (!videoId || !showPreview) return

    // Function to initialize the YouTube player
    const initializeYouTubePlayer = () => {
      if (!playerContainerRef.current) return

      // Clear any existing player
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy()
        } catch (e) {
          console.error("Error destroying YouTube player:", e)
        }
      }

      try {
        console.log("Initializing YouTube player with videoId:", videoId)
        playerRef.current = new window.YT.Player("youtube-player", {
          height: "100%",
          width: "100%",
          videoId: videoId,
          playerVars: {
            autoplay: 0, // Don't autoplay initially
            controls: 1,
            rel: 0,
            fs: 1,
            modestbranding: 1,
            showinfo: 1,
            start: timeRange[0],
            origin: window.location.origin,
            playsinline: 1,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log("YouTube player ready")
              setIsPlayerReady(true)

              // Get video duration and update the slider range
              try {
                const duration = event.target.getDuration()
                console.log("Video duration:", duration)
                setVideoDuration(duration)

                // Get the constraints based on selected clip length
                const { minGap } = getClipLengthConstraints()

                // Update the time range to start at 0 and end at either minGap or full duration
                const newEnd = Math.min(minGap, duration)
                setTimeRange([0, newEnd])
                previousTimeRangeRef.current = [0, newEnd]
              } catch (e) {
                console.error("Error getting video duration:", e)
              }

              // Seek to the start position but don't play
              event.target.cueVideoById({
                videoId: videoId,
                startSeconds: 0,
              })
              event.target.pauseVideo()
            },
            onStateChange: (event: any) => {
              console.log("Player state changed:", event.data)
              // 1 = playing, 2 = paused
              if (event.data === 1) {
                // Update current time when playing
                setVideoCurrentTime(event.target.getCurrentTime())
              }
            },
            onError: (event: any) => {
              console.error("YouTube player error:", event.data)
            },
          },
        })
      } catch (error) {
        console.error("Error initializing YouTube player:", error)
      }
    }

    // Load YouTube API script if not already loaded
    if (!window.YT || !window.YT.Player) {
      if (!ytApiLoadedRef.current) {
        ytApiLoadedRef.current = true
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        // Set up the YouTube API callback
        window.onYouTubeIframeAPIReady = () => {
          console.log("YouTube API ready")
          initializeYouTubePlayer()
        }
      }
    } else {
      // API already loaded, initialize player directly
      initializeYouTubePlayer()
    }

    return () => {
      // Clean up
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy()
          playerRef.current = null
        } catch (e) {
          console.error("Error destroying YouTube player:", e)
        }
      }
    }
  }, [videoId, showPreview])

  // Listen for scroll events to change header transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
            if (entry.target.id) {
              setActiveSection(entry.target.id)
            }
          }
        })
      },
      { threshold: 0.3 },
    )

    const sections = document.querySelectorAll(".section-animate")
    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section)
      })
    }
  }, [])

  // Load user settings from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const storedSettings = localStorage.getItem("userSettings")
      if (storedSettings) {
        const settings: UserSettings = JSON.parse(storedSettings)
        setClipLength(settings.clipLength)
        setSelectedTemplate(settings.selectedTemplate)
        setMusicEnabled(settings.musicEnabled)
        setMusicSelection(settings.musicSelection)
        setSelectedMusic(settings.selectedMusic)
        setMemeHook(settings.memeHook)
        setGameVideo(settings.gameVideo)
        setHookTitle(settings.hookTitle)
        setCallToAction(settings.callToAction)
        setBackgroundMusic(settings.backgroundMusic)
        setLayout(settings.layout)
      }

      // Restore pending video URL and time range after login
      const pendingVideoUrl = localStorage.getItem("pendingVideoUrl")
      const pendingTimeRange = localStorage.getItem("pendingTimeRange")

      if (pendingVideoUrl) {
        setYoutubeUrl(pendingVideoUrl)
        setShowPreview(true)
        localStorage.removeItem("pendingVideoUrl")

        if (pendingTimeRange) {
          setTimeRange(JSON.parse(pendingTimeRange))
          localStorage.removeItem("pendingTimeRange")
        }

        // Auto-show subscription modal after restoring video
        setTimeout(() => {
          setShowSubscriptionModal(true)
        }, 1000)
      }
    }
  }, [isAuthenticated])

  // Save user settings to localStorage
  const saveUserSettings = () => {
    // Save settings regardless of authentication status
    const settings: UserSettings = {
      clipLength,
      selectedTemplate,
      musicEnabled,
      musicSelection,
      selectedMusic,
      memeHook,
      gameVideo,
      hookTitle,
      callToAction,
      backgroundMusic,
      layout,
    }
    localStorage.setItem("userSettings", JSON.stringify(settings))
  }

  // Smooth scroll function
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    const element = ref.current
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Handle Google login
  const handleGoogleLogin = async () => {
    await login("google")
  }

  // Function to determine user badge
  const getUserBadge = () => {
    if (!user || !user.subscription) return null

    switch (user.email) {
      case "test@example.com":
        return { 
          text: "PRO", 
          className: "bg-teal-400 text-black text-xs uppercase font-bold" 
        }
      case "expert@example.com":
        return {
          text: "EXPERT",
          className: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs uppercase font-bold border border-yellow-300 shadow-lg"
        }
      case "business@example.com":
        return { 
          text: "BUSINESS", 
          className: "bg-blue-400 text-black text-xs uppercase font-bold" 
        }
      default:
        return null
    }
  }

  const handleGenerate = async () => {
    if (!user) {
      router.push('/auth')
      return
    }

    // Check if user has a valid subscription
    if (!user.subscription || user.subscription.status !== "active") {
      setShowSubscriptionModal(true)
      return
    }

    if (!youtubeUrl.trim()) {
      alert("Please enter a YouTube URL")
      return
    }

    // setGenerating(true)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000))

      // setGenerationComplete(true)
    } catch (error) {
      console.error("Generation failed:", error)
      alert("Generation failed. Please try again.")
    } finally {
      // setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200 relative overflow-hidden">
      {/* AI Digital Pattern Background */}
      <AIBackground />

      {/* Header - Transparent until scrolled */}
      <header
        className={cn(
          "py-6 px-8 fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-gray-900/95 backdrop-blur-sm" : "bg-transparent",
        )}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 z-10" onClick={() => scrollToSection(heroRef)}>
            <Film className="h-10 w-10 text-teal-400" />
            <h1 className="text-3xl font-medium text-white tracking-tight">MakeItReel</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8 items-center">
            <button
              onClick={() => scrollToSection(heroRef)}
              className={`hover:text-teal-400 transition-colors text-lg font-light ${
                activeSection === "hero" ? "text-teal-400" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection(howItWorksRef)}
              className={`hover:text-teal-400 transition-colors text-lg font-light ${
                activeSection === "how-it-works" ? "text-teal-400" : ""
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection(featuresRef)}
              className={`hover:text-teal-400 transition-colors text-lg font-light ${
                activeSection === "features" ? "text-teal-400" : ""
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection(testimonialsRef)}
              className={`hover:text-teal-400 transition-colors text-lg font-light ${
                activeSection === "testimonials" ? "text-teal-400" : ""
              }`}
            >
              Testimonials
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto p-2 hover:bg-gray-800/50">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={32}
                          height={32}
                          className="rounded-full border-2 border-teal-400"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="hidden md:flex items-center gap-2">
                        <span className="text-white font-light max-w-[120px] truncate">
                          {user.name}
                        </span>
                        {getUserBadge() && (
                          <Badge className={getUserBadge()?.className}>
                            {getUserBadge()?.text}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-1.5 text-sm">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground text-xs">{user.email}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/terms")}>
                      <FileVideo className="mr-2 h-4 w-4" />
                      Terms & Conditions
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/auth/logout")}>
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <button
                onClick={() => router.push("/auth")}
                className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-white transition-colors text-lg font-light"
              >
                Get Started
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden flex flex-col gap-4 mt-4 px-6 py-4 bg-gray-900/95 backdrop-blur-sm rounded-lg">
            <button
              onClick={() => {
                scrollToSection(heroRef)
                setMobileMenuOpen(false)
              }}
              className="hover:text-teal-400 transition-colors py-2 font-light text-left"
            >
              Home
            </button>
            <button
              onClick={() => {
                scrollToSection(howItWorksRef)
                setMobileMenuOpen(false)
              }}
              className="hover:text-teal-400 transition-colors py-2 font-light text-left"
            >
              How It Works
            </button>
            <button
              onClick={() => {
                scrollToSection(featuresRef)
                setMobileMenuOpen(false)
              }}
              className="hover:text-teal-400 transition-colors py-2 font-light text-left"
            >
              Features
            </button>
            <button
              onClick={() => {
                scrollToSection(testimonialsRef)
                setMobileMenuOpen(false)
              }}
              className="hover:text-teal-400 transition-colors py-2 font-light text-left"
            >
              Testimonials
            </button>
            {isAuthenticated && user ? (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex items-center gap-3 mb-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full border-2 border-teal-400"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                      <div className="flex items-center gap-2">
                        <div className="text-white font-light">{user.name}</div>
                        {getUserBadge() && (
                          <Badge className={getUserBadge()?.className}>
                            {getUserBadge()?.text}
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-400 text-xs">{user.email}</div>
                    </div>
                </div>
                <button
                  onClick={() => {
                    router.push("/auth/logout")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white transition-colors text-lg font-light text-center"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  router.push("/auth")
                  setMobileMenuOpen(false)
                }}
                className="bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg text-white transition-colors text-lg font-light text-center mt-2"
              >
                Get Started
              </button>
            )}
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        id="hero"
        className="pt-32 pb-20 px-6 min-h-screen flex items-center section-animate opacity-0 relative z-10"
      >
        <div className="container mx-auto max-w-4xl">
          {/* Page Title */}
          <h2 className="text-5xl font-light text-white text-center mb-16 tracking-tight">
            Transform YouTube Videos into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500 font-normal relative">
              <span className="absolute inset-0 blur-sm bg-gradient-to-r from-teal-400/40 to-emerald-500/40 bg-clip-text"></span>
              AI-Powered Shorts
            </span>
          </h2>

          {/* YouTube Link Input - Big and centered */}
          <div className="flex flex-col md:flex-row gap-3 mb-10">
            <div className="flex-grow">
              <Input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube video link here..."
                className="bg-gray-800/70 border-gray-700 focus:border-teal-400 focus:ring-teal-400/10 py-8 text-lg rounded-xl font-light"
              />
            </div>
            <Button
              onClick={handlePreview}
              className="bg-teal-600 hover:bg-teal-500 text-white py-8 px-8 text-lg rounded-xl font-light"
            >
              <Play className="mr-2 h-5 w-5" /> Preview
            </Button>
          </div>

          {/* Video Preview */}
          {showPreview && videoId && (
            <div className="w-full bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl mb-10 animate-fade-in">
              <h3 className="text-xl font-light mb-4">Video Preview</h3>
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg" ref={playerContainerRef}>
                {/* Simple iframe that will be replaced by the YouTube API */}
                <div id="youtube-player" className="absolute top-0 left-0 w-full h-full"></div>
              </div>

              {/* Generate Button - Only shown after preview */}
              <div className="w-full flex justify-center mt-8">
                <Button
                  onClick={() => setShowOptions(!showOptions)}
                  className="bg-teal-600 hover:bg-teal-500 text-white py-8 px-10 text-xl rounded-xl flex items-center gap-3 font-light"
                >
                  🎬 Generate AI Shorts
                  {showOptions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          )}

          {/* Additional Options - Only shown when Generate button is clicked */}
          {showOptions && (
            <div className="space-y-8 bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl transition-all duration-300 ease-in-out animate-fade-in">
              {/* Processing Timeframe */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-light">Processing Timeframe</Label>
                  <div className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                      Select the portion of the video you want to process
                    </div>
                  </div>
                  <Button variant="ghost" className="ml-auto text-blue-400 text-sm h-7 px-3">
                    Select from Transcript
                  </Button>
                </div>

                <div className="px-1">
                <Slider
  value={timeRange}
  min={0}
  max={videoDuration}
  step={1}
  onValueChange={handleTimeRangeChange}
  className="py-4"
  onMouseDown={handleSliderMouseDown}
  onMouseUp={handleSliderMouseUp}
  onTouchStart={(e) => handleSliderMouseDown(e.nativeEvent)}  // ✅ dynamic handle detection
  onTouchEnd={handleSliderMouseUp}
/>

                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>{formatTime(timeRange[0])}</span>
                    <span>{formatTime(timeRange[1])}</span>
                  </div>
                </div>
              </div>

              {/* Preferred Clip Length */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-light">Preferred Clip length</Label>
                  <div className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                      Choose your preferred output length
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant={clipLength === "<30s" ? "default" : "outline"}
                    onClick={() => setClipLength("<30s")}
                    className={cn(
                      "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                      clipLength === "<30s" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                    )}
                  >
                    &lt;30s
                  </Button>
                  <Button
                    variant={clipLength === "30s-60s" ? "default" : "outline"}
                    onClick={() => setClipLength("30s-60s")}
                    className={cn(
                      "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                      clipLength === "30s-60s" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                    )}
                  >
                    30s~60s
                  </Button>
                  <Button
                    variant={clipLength === "60s-90s" ? "default" : "outline"}
                    onClick={() => setClipLength("60s-90s")}
                    className={cn(
                      "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                      clipLength === "60s-90s" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                    )}
                  >
                    60s~90s
                  </Button>
                  <Button
                    variant={clipLength === "original" ? "default" : "outline"}
                    onClick={() => setClipLength("original")}
                    className={cn(
                      "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                      clipLength === "original" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                    )}
                  >
                    Original
                  </Button>
                </div>
              </div>

              {/* Template */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label className="text-lg font-light">Template</Label>
                  <div className="relative group">
                    <Info className="h-4 w-4 text-gray-400" />
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                      Choose a template style for your short
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex gap-3 overflow-x-auto pb-4 snap-x">
                    <div
                      className={cn(
                        "min-w-[185px] h-[260px] rounded-lg overflow-hidden border-2 snap-start cursor-pointer relative",
                        selectedTemplate === "hormozi1" ? "border-blue-500" : "border-transparent",
                      )}
                      onClick={() => setSelectedTemplate("hormozi1")}
                    >
                      <Image
                        src="/images/template-hormozi1.gif"
                        alt="Hormozi1 Template"
                        width={185}
                        height={260}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="bg-red-600 text-white text-xs px-2 py-1 rounded inline-block">IS THAT</div>
                        <div className="text-white text-xs mt-1">AS</div>
                      </div>
                      <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">Hormozi1</div>
                    </div>

                    <div
                      className={cn(
                        "min-w-[185px] h-[260px] rounded-lg overflow-hidden border-2 snap-start cursor-pointer relative",
                        selectedTemplate === "hormozi2" ? "border-blue-500" : "border-transparent",
                      )}
                      onClick={() => setSelectedTemplate("hormozi2")}
                    >
                      <Image
                        src="/images/template-hormozi2.gif"
                        alt="Hormozi2 Template"
                        width={185}
                        height={260}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="bg-green-600 text-white text-xs px-2 py-1 rounded inline-block">BECAUSE</div>
                        <div className="text-white text-xs mt-1">IT</div>
                      </div>
                      <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">Hormozi2</div>
                    </div>

                    <div
                      className={cn(
                        "min-w-[185px] h-[260px] rounded-lg overflow-hidden border-2 snap-start cursor-pointer relative",
                        selectedTemplate === "karaoke" ? "border-blue-500" : "border-transparent",
                      )}
                      onClick={() => setSelectedTemplate("karaoke")}
                    >
                      <Image
                        src="/images/template-karaoke.gif"
                        alt="Karaoke Template"
                        width={185}
                        height={260}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <div className="text-white text-xs">
                          IS THAT <span className="text-green-400">THEY'RE</span>
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">Karaoke</div>
                    </div>

                    <div
                      className={cn(
                        "min-w-[185px] h-[260px] rounded-lg overflow-hidden border-2 snap-start cursor-pointer relative",
                        selectedTemplate === "custom" ? "border-blue-500" : "border-transparent",
                      )}
                      onClick={() => setSelectedTemplate("custom")}
                    >
                      <Image
                        src="/images/template-custom.gif"
                        alt="Custom Template"
                        width={185}
                        height={260}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute bottom-2 left-0 right-0 text-center text-white text-sm">Custom</div>
                    </div>
                  </div>
                  <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800/80 rounded-full p-1">
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Background Music */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="background-music" className="font-light">
                      Background Music
                    </Label>
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                        Add background music to your video
                      </div>
                    </div>
                  </div>
                  <Switch id="background-music" checked={musicEnabled} onCheckedChange={setMusicEnabled} />
                </div>

                {musicEnabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-700">
                    <div className="flex gap-4">
                      <Button
                        variant={musicSelection === "random" ? "default" : "outline"}
                        onClick={() => setMusicSelection("random")}
                        className={cn(
                          "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                          musicSelection === "random"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "hover:text-teal-400",
                        )}
                      >
                        Random
                      </Button>
                      <Button
                        variant={musicSelection === "select" ? "default" : "outline"}
                        onClick={() => setMusicSelection("select")}
                        className={cn(
                          "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                          musicSelection === "select"
                            ? "bg-blue-500 hover:bg-blue-600 text-white"
                            : "hover:text-teal-400",
                        )}
                      >
                        Select
                      </Button>
                    </div>

                    {musicSelection === "select" && (
                      <MusicSelector onSelect={setSelectedMusic} selectedMusic={selectedMusic} />
                    )}
                  </div>
                )}
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Advanced Options</h3>

                {/* Meme Hook */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="meme-hook" className="font-light">
                      Meme Hook
                    </Label>
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                        Add a meme hook to your video
                      </div>
                    </div>
                  </div>
                  <Switch id="meme-hook" checked={memeHook} onCheckedChange={setMemeHook} />
                </div>

                {/* Game Video */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="game-video" className="font-light">
                      Game Video
                    </Label>
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                        Add game footage to your video
                      </div>
                    </div>
                  </div>
                  <Switch id="game-video" checked={gameVideo} onCheckedChange={setGameVideo} />
                </div>

                {/* Hook Title */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="hook-title" className="font-light">
                      Hook Title
                    </Label>
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                        Add a hook title to your video
                      </div>
                    </div>
                  </div>
                  <Switch id="hook-title" checked={hookTitle} onCheckedChange={setHookTitle} />
                </div>

                {/* Call To Action */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="call-to-action" className="font-light">
                      Call To Action
                    </Label>
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                        Add a call to action to your video
                      </div>
                    </div>
                  </div>
                  <Switch id="call-to-action" checked={callToAction} onCheckedChange={setCallToAction} />
                </div>

                {/* Layout */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-light">Layout</Label>
                    <div className="relative group">
                      <Info className="h-4 w-4 text-gray-400" />
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-xs p-2 rounded w-48">
                        Choose the layout for your video
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setLayout("auto")}
                      className={cn(
                        "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                        layout === "auto" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                      )}
                    >
                      Auto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLayout("fill")}
                      className={cn(
                        "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                        layout === "fill" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                      )}
                    >
                      Fill
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLayout("fit")}
                      className={cn(
                        "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                        layout === "fit" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                      )}
                    >
                      Fit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setLayout("square")}
                      className={cn(
                        "bg-gray-800/70 border-gray-700 hover:bg-gray-700",
                        layout === "square" ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:text-teal-400",
                      )}
                    >
                      Square
                    </Button>
                  </div>
                </div>
              </div>

              {/* Final Generate Button */}
              <Button
                onClick={handleStartGeneration}
                className="w-full bg-teal-600 hover:bg-teal-500 text-white py-7 text-xl mt-6 font-light"
              >
                🚀 Start Generation
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className="py-20 px-6 bg-gray-900/50 section-animate opacity-0 relative z-10"
      >
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-light text-center mb-16">
            How <span className="text-teal-400 font-normal">MakeItReel</span> Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-600/20 rounded-full flex items-center justify-center mb-6 text-teal-400 font-medium text-xl">
                1
              </div>
              <h3 className="text-2xl font-normal mb-4 text-white">Paste YouTube Link</h3>
              <p className="text-gray-300 font-light">
                Simply paste the URL of any YouTube video you want to transform into short-form content.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-600/20 rounded-full flex items-center justify-center mb-6 text-teal-400 font-medium text-xl">
                2
              </div>
              <h3 className="text-2xl font-normal mb-4 text-white">Customize Options</h3>
              <p className="text-gray-300 font-light">
                Choose your platform, style preferences, dimensions, and duration for the perfect short video.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-600/20 rounded-full flex items-center justify-center mb-6 text-teal-400 font-medium text-xl">
                3
              </div>
              <h3 className="text-2xl font-normal mb-4 text-white">Generate & Share</h3>
              <p className="text-gray-300 font-light">
                Our AI creates your short video in minutes. Download and share directly to your favorite platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-20 px-6 section-animate opacity-0 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-light text-center mb-16">
            Powerful <span className="text-teal-400 font-normal">Features</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2 text-white">AI-Powered Editing</h3>
                <p className="text-gray-300 font-light">
                  Our advanced AI identifies the most engaging parts of your videos and creates perfect short-form
                  content.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2 text-white">Multiple Platforms</h3>
                <p className="text-gray-300 font-light">
                  Optimize for TikTok, Instagram Reels, or YouTube Shorts with platform-specific dimensions and formats.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2 text-white">Custom Voiceovers</h3>
                <p className="text-gray-300 font-light">
                  Choose from multiple voice styles to narrate your content perfectly or keep the original audio.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2 text-white">Auto-Captions</h3>
                <p className="text-gray-300 font-light">
                  Automatically generate accurate captions in multiple styles to increase engagement and accessibility.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2 text-white">Fast Processing</h3>
                <p className="text-gray-300 font-light">
                  Generate high-quality shorts in minutes, not hours. Save time and focus on creating more content.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-xl font-normal mb-2 text-white">Content Library</h3>
                <p className="text-gray-300 font-light">
                  Store all your generated shorts in your personal library for easy access and management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        id="testimonials"
        className="py-20 px-6 bg-gray-900/50 section-animate opacity-0 relative z-10"
      >
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl font-light text-center mb-16">
            What Our <span className="text-teal-400 font-normal">Users Say</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="Sarah J."
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-normal text-white">Sarah J.</h4>
                  <p className="text-gray-400 text-sm">Content Creator</p>
                </div>
              </div>
              <p className="text-gray-300 font-light italic">
                "MakeItReel has completely transformed my content strategy. I can now repurpose my long YouTube videos
                into engaging shorts in minutes. My engagement has increased by 300%!"
              </p>
              <div className="flex mt-4 text-teal-400">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="Michael T."
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-normal text-white">Michael T.</h4>
                  <p className="text-gray-400 text-sm">Marketing Director</p>
                </div>
              </div>
              <p className="text-gray-300 font-light italic">
                "As a marketing team, we needed a solution to quickly create short-form content. MakeItReel saves us
                hours of editing time and the AI consistently picks the most engaging clips."
              </p>
              <div className="flex mt-4 text-teal-400">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                  <Image
                    src="/placeholder.svg?height=48&width=48"
                    alt="Elena R."
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-normal text-white">Elena R.</h4>
                  <p className="text-gray-400 text-sm">Influencer</p>
                </div>
              </div>
              <p className="text-gray-300 font-light italic">
                "The auto-captions feature is a game-changer! My TikTok videos are getting more views because the AI
                creates perfect text overlays that keep viewers engaged throughout."
              </p>
              <div className="flex mt-4 text-teal-400">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} id="cta" className="py-20 px-6 section-animate opacity-0 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-light mb-6">
            Ready to <span className="text-teal-400 font-normal">Transform</span> Your Content?
          </h2>
          <p className="text-xl text-gray-300 font-light mb-10 max-w-2xl mx-auto">
            Join thousands of content creators who are saving time and increasing engagement with AI-powered shorts.
          </p>
          <Button
            onClick={() => scrollToSection(heroRef)}
            className="bg-teal-600 hover:bg-teal-500 text-white py-6 px-10 text-xl rounded-xl font-light inline-flex items-center gap-2"
          >
            Get Started Now <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800/30 bg-gray-900/80 relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <Film className="h-8 w-8 text-teal-400" />
              <h1 className="text-2xl font-medium text-white tracking-tight">MakeItReel</h1>
            </div>
            <div className="flex gap-8">
              <Link href="/terms" className="text-gray-400 hover:text-teal-400 transition-colors">
                Terms & Conditions
              </Link>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Contact
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors">
                Help
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8">
            <div className="text-sm text-gray-400">
              <div>© {new Date().getFullYear()} MakeItReel. All rights reserved.</div>
            </div>
          </div>
        </div>
      </footer>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={showSubscriptionModal} 
        onClose={() => setShowSubscriptionModal(false)} 
      />
    </div>
  )
}