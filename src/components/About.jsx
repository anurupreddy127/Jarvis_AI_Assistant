import React from 'react'
import '../css/about.css'

export default function About() {
  return (
    <section className="about" id="about">
      <div className="about-container">
        <h2 className="about-title">What is Jarvis?</h2>
        <p className="about-text">
          Jarvis is an AI-powered Chrome extension that transforms your voice commands into 
          instant, seamless navigation—leveraging cutting-edge neural processing directly 
          in your browser. Think of it as your personal voice co-pilot for the web.
        </p>
      </div>
    </section>
  )
}
