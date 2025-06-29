import React, { useEffect, useState } from 'react'
import '../css/navbar.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, targetId) => {
    e.preventDefault()
    const targetSection = document.querySelector(targetId)
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <div className="nav-brand">
          <div className="logo">
            <div className="logo-ring">
              <div className="logo-core">J</div>
            </div>
            <span className="brand-text">JARVIS</span>
          </div>
        </div>
        <div className="nav-links">
          <a href="#features" onClick={(e) => handleNavClick(e, '#features')}>Neural Features</a>
          <a href="#demo" onClick={(e) => handleNavClick(e, '#demo')}>AI Demo</a>
          <a href="#download" onClick={(e) => handleNavClick(e, '#download')}>Deploy</a>
        </div>
      </nav>
    </header>
  )
}

export default Header