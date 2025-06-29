// src/components/Features.jsx
import React, { useEffect, useRef } from 'react'
import '../css/features.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const featuresData = [
  {
    icon: '🗣️',
    title: 'Accurate Speech Recognition',
    description:
      'Leveraging the Web Speech API and ElevenLabs’ neural audio models, Jarvis captures your voice commands with 99.7% accuracy—even in noisy environments.',
  },
  {
    icon: '🔗',
    title: 'Context-Aware Navigation',
    description:
      'Jarvis parses not just keywords but full intent. Say “scroll down until I see the pricing section,” and it’ll find and jump straight there.',
  },
  {
    icon: '🤖',
    title: 'Natural-Language Search',
    description:
      'Forget exact queries—just speak naturally. “Show me the latest tech reviews” becomes a Google search, all done hands-free.',
  },
  {
    icon: '🗣️',
    title: 'Dynamic Voice Responses',
    description:
      'With ElevenLabs’ expressive TTS, Jarvis doesn’t just beep—it speaks back in a clear, human-like voice, confirming actions and reading out results.',
  },
  {
    icon: '✋',
    title: 'Zero-Hands Mode',
    description:
      'Ideal for accessibility or when you’re multitasking: Jarvis will keep browsing, reading, and interacting without you touching the keyboard or mouse.',
  },
]

export default function Features() {
  const containerRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const cards = containerRef.current.querySelectorAll('.feature-card')

    gsap.to(cards, {
      // drift each card up/left; increase distance per index
      x: i => -150 - i * 30,
      y: i => -150 - i * 30,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [])

  return (
    <section id="features" className="features-section">
      <div className="features-container" ref={containerRef}>
        <h2 className="features-heading">Neural Features</h2>
        <div className="features-grid">
          {featuresData.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
