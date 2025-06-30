import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import VoiceSphere from './components/Voices'
import Demo from './components/Demo'

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <VoiceSphere />
        <Demo />
      </main>

    </div>
  )
}

export default App