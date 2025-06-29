// src/components/Hero.jsx
import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import HumanFigure from './HumanFigure'
import '../css/hero.css';

const Hero = () => {
  const titleRef       = useRef(null)
  const descriptionRef = useRef(null)
  const actionsRef     = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()
    tl.from(titleRef.current, { duration: 1, y: 50, opacity: 0, delay: 0.5 })
      .from(descriptionRef.current, { duration: 1, y: 30, opacity: 0 }, '-=0.7')
      .from(actionsRef.current,    { duration: 1, y: 30, opacity: 0 }, '-=0.7')
  }, [])

  const handleInstallExtension = () => {
    alert(
      'To install Jarvis:\n\n' +
      '1. Visit the Chrome Web Store\n' +
      '2. Search for "Jarvis Voice Navigator"\n' +
      '3. Click "Add to Chrome"\n' +
      '4. Follow the installation prompts\n\n' +
      'Note: This is a demo. Replace with actual Chrome Web Store link.'
    )
  }

  return (
    <section className="hero">
      {/* 1. Full-bleed 3D background canvas */}
      

      {/* 2. Your text & buttons on top */}
      <div className="hero-container">
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title" ref={titleRef}>
              <span className="ai-text">AI-POWERED</span>
              <span className="gradient-text">VOICE NAVIGATION</span>
              <span className="subtitle">FOR THE FUTURE WEB</span>
            </h1>
            <p className="hero-description" ref={descriptionRef}>
              Experience the next evolution of web browsing with JARVIS - an advanced AI
              Chrome extension that transforms voice commands into seamless Google navigation
              through cutting-edge neural processing.
            </p>
            <div className="hero-actions" ref={actionsRef}>
              <button className="cta-button" onClick={handleInstallExtension}>
                <span className="button-glow"></span>
                {/* …SVG icon… */}
                INITIALIZE JARVIS
              </button>
              <button className="secondary-button">
                <span className="button-scan"></span>
                {/* …SVG icon… */}
                NEURAL DEMO
              </button>
            </div>
          </div>
        </div>

      </div>
      <div className="hero-background">
                <HumanFigure />
      </div>
    </section>
  )
}

export default Hero
