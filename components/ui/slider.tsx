"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [isDragging, setIsDragging] = React.useState(false)
  const [startPosition, setStartPosition] = React.useState({ x: 0, values: [0, 0] })
  const trackRef = React.useRef<HTMLDivElement>(null)

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current || !props.value || !props.onValueChange) return

    const rect = trackRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const trackWidth = rect.width
    const range = (props.max || 100) - (props.min || 0)
    const clickValue = ((clickX / trackWidth) * range) + (props.min || 0)

    // Check if click is on the range (blue part) or track
    const rangeElement = trackRef.current.querySelector('[class*="SliderPrimitive-Range"]')
    const isClickInGap = clickValue >= props.value[0] && clickValue <= props.value[1]
    const isClickOnRange = e.target === rangeElement || e.target === rangeElement?.parentElement

    if (isClickInGap || isClickOnRange) {
      e.preventDefault()
      e.stopPropagation()
      
      const gapSize = props.value[1] - props.value[0]
      const initialX = e.clientX
      const initialValues = [...props.value]
      
      setIsDragging(true)
      setStartPosition({
        x: initialX,
        values: initialValues
      })

      const handleMouseMove = (e: MouseEvent) => {
        if (!trackRef.current) return
        
        const rect = trackRef.current.getBoundingClientRect()
        const trackWidth = rect.width
        const range = (props.max || 100) - (props.min || 0)
        const deltaX = e.clientX - initialX
        const valueDelta = (deltaX / trackWidth) * range

        let newStart = initialValues[0] + valueDelta
        let newEnd = initialValues[1] + valueDelta

        const minVal = props.min || 0
        const maxVal = props.max || 100

        // Ensure the gap maintains its size and stays within bounds
        if (newStart < minVal) {
          newStart = minVal
          newEnd = newStart + gapSize
        } else if (newEnd > maxVal) {
          newEnd = maxVal
          newStart = newEnd - gapSize
        }

        // Double check bounds after adjustment
        if (newStart >= minVal && newEnd <= maxVal) {
          props.onValueChange([newStart, newEnd])
        }
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track 
        ref={trackRef}
        onMouseDown={handleTrackMouseDown}
        className={cn(
          "relative h-2 w-full grow overflow-hidden rounded-full bg-gray-700",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        <SliderPrimitive.Range 
          className={cn(
            "absolute h-full bg-blue-500",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )} 
        />
      </SliderPrimitive.Track>
      {props.value?.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block h-5 w-5 rounded-full border-2 border-white bg-blue-500 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }