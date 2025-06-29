// src/components/Header.jsx
import React, { useEffect, useState } from 'react'
import '../css/navbar.css'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // don’t render anything until the page is scrolled
  if (!isScrolled) return null

  return (
    <header className="header scrolled">
      <nav className="nav">
        {/* hamburger button */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu toggle"
        >
          <span /><span /><span />
        </button>

        {/* on small screens this becomes our dropdown */}
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#features">Neural Features</a>
          <a href="#demo">AI Demo</a>
          <a href="#download">Deploy</a>
        </div>
      </nav>
    </header>
  )
}
