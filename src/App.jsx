// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import VoiceSphere from './components/Voices'
import Demo from './components/Demo'
import DownloadSection from './components/DownloadSection'
import SubscriptionPage from './components/SubscriptionPage' // create this file

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Features />
        <VoiceSphere />
        <Demo />
        <DownloadSection />
      </main>
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/subscriptions" element={<SubscribePage />} />
      </Routes>
    </Router>
  )
}

export default App
