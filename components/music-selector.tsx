"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause } from "lucide-react"
import { useRef } from "react"

interface MusicOption {
  id: string
  name: string
  duration: string
  file: string
}

interface MusicSelectorProps {
  onSelect: (music: MusicOption | null) => void
  selectedMusic: MusicOption | null
}

const musicOptions: MusicOption[] = [
  { id: "rave", name: "Rave", duration: "02:49", file: "/music/rave.mp3" },
  { id: "blade-runner", name: "Blade Runner", duration: "03:35", file: "/music/blade-runner.mp3" },
  { id: "snow-fall", name: "Snow Fall", duration: "01:32", file: "/music/snow-fall.mp3" },
  { id: "dramamine", name: "dramamine", duration: "02:59", file: "/music/dramamine.mp3" },
]

export default function MusicSelector({ onSelect, selectedMusic }: MusicSelectorProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = (music: MusicOption) => {
    if (playingId === music.id) {
      // Pause if already playing
      audioRef.current?.pause()
      setPlayingId(null)
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.pause()
      }

      audioRef.current = new Audio(music.file)
      audioRef.current.play()
      audioRef.current.onended = () => {
        setPlayingId(null)
      }
      setPlayingId(music.id)
    }
  }

  return (
    <Card className="border-gray-700 bg-gray-800/70">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Select music</h3>
        <div className="space-y-2">
          {musicOptions.map((music) => (
            <div
              key={music.id}
              className={`flex items-center justify-between p-3 rounded-md cursor-pointer hover:bg-gray-700/50 ${
                selectedMusic?.id === music.id ? "bg-gray-700/70 border border-blue-500/50" : ""
              }`}
              onClick={() => onSelect(music)}
            >
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlay(music)
                  }}
                >
                  {playingId === music.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span>{music.name}</span>
              </div>
              <span className="text-gray-400 text-sm">{music.duration}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
