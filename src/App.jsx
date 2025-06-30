import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <Voices />
      </main>

    </div>
  )
}

export default App