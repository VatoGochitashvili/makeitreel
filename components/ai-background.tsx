"use client"

import { useEffect, useRef } from "react"

export default function AIBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Nodes and connections
    class Node {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      canvasWidth: number
      canvasHeight: number

      constructor(x: number, y: number, width: number, height: number) {
        this.x = x
        this.y = y
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.radius = Math.random() * 1.5 + 0.5
        this.color = `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(
          Math.random() * 100 + 155,
        )}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.random() * 0.5 + 0.2})`
        this.canvasWidth = width
        this.canvasHeight = height
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > this.canvasWidth) this.vx *= -1
        if (this.y < 0 || this.y > this.canvasHeight) this.vy *= -1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Create nodes
    const nodeCount = Math.floor((canvas.width * canvas.height) / 15000) // Adjust density based on screen size
    const nodes: Node[] = []

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node(Math.random() * canvas.width, Math.random() * canvas.height, canvas.width, canvas.height))
    }

    // Digital circuit patterns
    const drawCircuitPatterns = () => {
      if (!ctx) return

      // Draw horizontal and vertical lines
      ctx.strokeStyle = "rgba(76, 217, 191, 0.15)"
      ctx.lineWidth = 0.5

      // Horizontal lines
      const horizontalLineCount = 8
      const horizontalGap = canvas.height / horizontalLineCount

      for (let i = 0; i < horizontalLineCount; i++) {
        const y = i * horizontalGap
        ctx.beginPath()

        // Create a wavy line
        for (let x = 0; x < canvas.width; x += 5) {
          const amplitude = 5
          const frequency = 0.01
          const wave = Math.sin(x * frequency + i) * amplitude

          if (x === 0) {
            ctx.moveTo(x, y + wave)
          } else {
            ctx.lineTo(x, y + wave)
          }
        }

        ctx.stroke()
      }

      // Vertical lines
      const verticalLineCount = 15
      const verticalGap = canvas.width / verticalLineCount

      for (let i = 0; i < verticalLineCount; i++) {
        const x = i * verticalGap
        ctx.beginPath()

        // Create a wavy line
        for (let y = 0; y < canvas.height; y += 5) {
          const amplitude = 5
          const frequency = 0.01
          const wave = Math.sin(y * frequency + i) * amplitude

          if (y === 0) {
            ctx.moveTo(x + wave, y)
          } else {
            ctx.lineTo(x + wave, y)
          }
        }

        ctx.stroke()
      }

      // Draw circuit nodes
      const circuitNodeCount = 20
      ctx.strokeStyle = "rgba(76, 217, 191, 0.05)"
      ctx.lineWidth = 0.3

      for (let i = 0; i < circuitNodeCount; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 1.5 + 0.5

        ctx.beginPath()
        ctx.moveTo(x, y - size)
        ctx.lineTo(x + size, y)
        ctx.lineTo(x, y + size)
        ctx.lineTo(x - size, y)
        ctx.closePath()
        ctx.stroke()
      }
    }

    // Hexagonal grid
    const drawHexGrid = () => {
      if (!ctx) return

      const hexSize = 30
      const hexHeight = hexSize * Math.sqrt(3)
      const columns = Math.ceil(canvas.width / (hexSize * 1.5)) + 1
      const rows = Math.ceil(canvas.height / hexHeight) + 1

      ctx.strokeStyle = "rgba(76, 217, 191, 0.05)"
      ctx.lineWidth = 0.5

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          const x = j * hexSize * 1.5
          const y = i * hexHeight + (j % 2 === 0 ? 0 : hexHeight / 2)

          ctx.beginPath()
          for (let k = 0; k < 6; k++) {
            const angle = ((2 * Math.PI) / 6) * k
            const hx = x + hexSize * Math.cos(angle)
            const hy = y + hexSize * Math.sin(angle)

            if (k === 0) {
              ctx.moveTo(hx, hy)
            } else {
              ctx.lineTo(hx, hy)
            }
          }
          ctx.closePath()
          ctx.stroke()
        }
      }
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "rgba(26, 26, 26, 0.8)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw digital patterns
      drawCircuitPatterns()
      drawHexGrid()

      // Update and draw nodes
      nodes.forEach((node) => {
        node.update()
        node.draw()
      })

      // Draw connections between nearby nodes
      ctx.strokeStyle = "rgba(76, 217, 191, 0.1)"
      ctx.lineWidth = 0.3

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-60" />
}
