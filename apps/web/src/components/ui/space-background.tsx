"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  color: string
  radius: number
  x: number
  y: number
  ring: number
  move: number
  random: number
}

interface SpaceBackgroundProps {
  particleCount?: number
  particleColor?: string
  backgroundColor?: string
  className?: string
}

export function SpaceBackground({
  particleCount = 450,
  particleColor = "rgba(255,255,255,0.85)",
  backgroundColor = "transparent",
  className = "",
}: SpaceBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let ratio = window.innerHeight < 400 ? 0.6 : 1
    const state = {
      particles: [] as Particle[],
      r: 120,
      counter: 0,
    }

    const setupCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.setTransform(ratio, 0, 0, -ratio, canvas.width / 2, canvas.height / 2)
    }
    setupCanvas()

    const createParticle = () => {
      state.particles.push({
        color: particleColor,
        radius: Math.random() * 5,
        x: Math.cos(Math.random() * 7 + Math.PI) * state.r,
        y: Math.sin(Math.random() * 7 + Math.PI) * state.r,
        ring: Math.random() * state.r * 3,
        move: (Math.random() * 4 + 1) / 500,
        random: Math.random() * 7,
      })
    }
    for (let i = 0; i < particleCount; i++) createParticle()

    const moveParticle = (p: Particle) => {
      p.ring = Math.max(p.ring - 1, state.r)
      p.random += p.move
      p.x = Math.cos(p.random + Math.PI) * p.ring
      p.y = Math.sin(p.random + Math.PI) * p.ring
    }

    const resetParticle = (p: Particle) => {
      p.ring = Math.random() * state.r * 3
      p.radius = Math.random() * 5
    }

    const disappear = (p: Particle) => {
      if (p.radius < 0.8) resetParticle(p)
      p.radius *= 0.994
    }

    const draw = (p: Particle) => {
      ctx.beginPath()
      ctx.fillStyle = p.color
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const loop = () => {
      ctx.clearRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2)
      if (state.counter < state.particles.length) state.counter++
      for (let i = 0; i < state.counter; i++) {
        disappear(state.particles[i])
        moveParticle(state.particles[i])
        draw(state.particles[i])
      }
      animationRef.current = requestAnimationFrame(loop)
    }

    animationRef.current = requestAnimationFrame(loop)

    const handleResize = () => {
      ratio = window.innerHeight < 400 ? 0.6 : 1
      setupCanvas()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [particleCount, particleColor])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        display: "block",
        width: "100%",
        height: "100%",
        background: backgroundColor,
        pointerEvents: "none",
      }}
    />
  )
}
