import React from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Features from '../components/Features'
import Demo from '../components/Demo'
import Download from '../components/Download'
import Footer from '../components/Footer'
import About from '../components/About'

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <Demo />
        <Download />
      </main>
      <Footer />
    </div>
  )
}

export default App