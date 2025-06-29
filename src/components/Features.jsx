import React from 'react'
import '../css/features.css'

const featuresData = [
  {
    title: 'Neural Voice Processing',
    description: 'Advanced speech recognition with 99.7% accuracy using quantum-enhanced NLP.',
    icon: '🗣️'
  },
  {
    title: 'Quantum Link Analysis',
    description: 'AI-powered semantic understanding identifies and executes precise link interactions.',
    icon: '🔗'
  },
  {
    title: 'Adaptive Learning Core',
    description: 'Self-evolving AI that learns your browsing patterns for personalized efficiency.',
    icon: '🤖'
  }
]

export default function Features() {
  return (
  <section id="features" className="features-section">
      {/* 1) full-bleed brain model */}
      <div className="features-background">
        <BrainFigure />
      </div>

      {/* 2) your feature cards on top */}
      <div className="features-container">
        <h2 className="features-title">Neural Features</h2>
        <div className="features-grid">
          {featuresData.map((f,i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-name">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
