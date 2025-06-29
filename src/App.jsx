import React from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <About />

      </main>

    </div>
  )
}

export default App