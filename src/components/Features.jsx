// src/components/Features.jsx
import React from 'react'
import BrainFigure from './BrainFigure'
import '../css/features.css'

const featuresData = [
  { icon: '🗣️', title: 'Neural Voice Processing',    description: '99.7% accuracy via quantum-enhanced NLP.' },
  { icon: '🔗', title: 'Quantum Link Analysis',        description: 'Semantic understanding for precise clicks.' },
  { icon: '🤖', title: 'Adaptive Learning Core',       description: 'Self-evolving patterns for personalized browsing.' },
]

export default function Features() {
  return (
    <section id="features" className="features-section">
      {/* background brain */}
      <div className="features-bg">
        <BrainFigure />
      </div>

      {/* overlay cards */}
      <div className="features-container">
        <h2>Neural Features</h2>
        <div className="features-grid">
          {featuresData.map((f,i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
