import React from 'react'
import HumanFigure from './HumanFigure'
import '../css/hero.css'

export default function Hero() {
  return (
    <section className="hero">
      {/* Full-bleed 3D background */}
      <div className="hero-background">
        <HumanFigure />
      </div>

      {/* Overlayed name */}
      <div className="hero-overlay">
        <h1>JARVIS</h1>
      </div>
    </section>
  )
}
