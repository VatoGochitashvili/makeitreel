"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

// Mock data for reels
const reelsMockData = [
  {
    id: 1,
    image: "/placeholder.svg?height=600&width=340",
    title: "Travel Vlog Highlights",
  },
  {
    id: 2,
    image: "/placeholder.svg?height=600&width=340",
    title: "Cooking Tutorial",
  },
  {
    id: 3,
    image: "/placeholder.svg?height=600&width=340",
    title: "Fitness Challenge",
  },
  {
    id: 4,
    image: "/placeholder.svg?height=600&width=340",
    title: "Tech Review",
  },
  {
    id: 5,
    image: "/placeholder.svg?height=600&width=340",
    title: "Fashion Tips",
  },
  {
    id: 6,
    image: "/placeholder.svg?height=600&width=340",
    title: "Gaming Highlights",
  },
]

export default function BackgroundReels() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Left side reels */}
      <div className="absolute -left-20 top-1/4 transform -translate-y-1/2 w-[300px] h-[600px] rotate-6">
        <div className="w-full h-full relative animate-float-slow">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          <div className="phone-frame">
            <div className="reels-container animate-scroll">
              {reelsMockData.map((reel) => (
                <div key={reel.id} className="reel-item">
                  <Image
                    src={reel.image || "/placeholder.svg"}
                    alt={reel.title}
                    width={340}
                    height={600}
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-light">
                    <p>{reel.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side reels */}
      <div className="absolute -right-20 top-2/3 transform -translate-y-1/2 w-[300px] h-[600px] -rotate-6">
        <div className="w-full h-full relative animate-float-slow-reverse">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          <div className="phone-frame">
            <div className="reels-container animate-scroll-reverse">
              {[...reelsMockData].reverse().map((reel) => (
                <div key={reel.id} className="reel-item">
                  <Image
                    src={reel.image || "/placeholder.svg"}
                    alt={reel.title}
                    width={340}
                    height={600}
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute bottom-4 left-4 right-4 text-white text-sm font-light">
                    <p>{reel.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center background reels */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[340px] h-[600px] opacity-20 blur-sm">
        <div className="w-full h-full relative animate-float-medium">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
          <div className="phone-frame">
            <div className="reels-container animate-scroll-medium">
              {reelsMockData.slice(2, 5).map((reel) => (
                <div key={reel.id} className="reel-item">
                  <Image
                    src={reel.image || "/placeholder.svg"}
                    alt={reel.title}
                    width={340}
                    height={600}
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
