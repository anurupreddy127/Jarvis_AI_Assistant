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
    icon: '🔍',
    title: 'Natural-Language Search',
    description:
      'Forget exact queries—just speak naturally. “Show me the latest tech reviews” becomes a Google search, all done hands-free.',
  },
  {
    icon: '💬',
    title: 'Dynamic Voice Responses',
    description:
      'With ElevenLabs’ expressive TTS, Jarvis doesn’t just beep—it speaks back in a clear, human-like voice, confirming actions and reading out results.',
  },
  {
    icon: '✋',
    title: 'Zero-Hands Mode',
    description:
      'Ideal for accessibility or multitasking: Jarvis keeps browsing, reading, and interacting without you touching keyboard or mouse.',
  },
]

export default function Features() {
  const containerRef = useRef(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const cards = containerRef.current.querySelectorAll('.feature-card')

    // build a timeline:
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',    // when top of features hits 80% down viewport
        end: 'bottom 20%',   // until bottom reaches 20% from top
        scrub: true,
      },
    })

    // from bottom-right, opacity 0 → to natural position, opacity 1
    tl.from(cards, {
      x: 200,              // start 200px to the right
      y: 200,              // and 200px down
      autoAlpha: 0,        // invisible
      ease: 'power1.out',
      stagger: 0.2,        // each card delays 0.2s after the last
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
