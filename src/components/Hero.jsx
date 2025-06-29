// src/components/Hero.jsx
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import HumanFigure from './HumanFigure'

const Hero = () => {
  const titleRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.from(titleRef.current, { duration: 1, y: 50, opacity: 0, delay: 0.5 })
  }, [])

  return (
    <section className="hero">
      {/* Full-bleed 3D background canvas */}
      <div className="hero-background">
        <HumanFigure />
      </div>

      {/* JARVIS text overlay */}
      <div className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title" ref={titleRef}>
            JARVIS
          </h1>
        </div>
      </div>
    </section>
  )
}

export default Hero