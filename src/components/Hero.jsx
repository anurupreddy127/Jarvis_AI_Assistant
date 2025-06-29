import React from 'react'
import HumanFigure from './HumanFigure'
import '../css/hero.css'

export default function Hero() {
  return (
    <section className="hero">
      {/* full-screen 3D canvas */}
      <div className="hero-canvas">
        <HumanFigure />
      </div>

      {/* overlayed text */}
      <div className="hero-title">JARVIS</div>
    </section>
  )
}
