import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function DownloadSection() {
  const navigate = useNavigate()

  const handleDownloadClick = () => {
    navigate('/subscribe')
  }

  return (
    <section id="download" style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{zIndex: 201}}>
        <h2 style={{ textAlign: 'center', fontSize: '3rem' }}>Download Jarvis</h2>
        <p style={{ textAlign: 'center' }}>Voice-powered AI for your browser</p>
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={handleDownloadClick} style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: 'pointer' }}>
            Subscribe to Download
          </button>
        </div>
      </div>
    </section>
  )
}
