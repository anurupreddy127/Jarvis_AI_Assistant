// src/components/Voices.jsx
import React, { useState, useEffect } from 'react'
import './voices.css'

export default function Voices() {
  const [voices, setVoices]     = useState([])
  const [hovered, setHovered]   = useState(null)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const key = import.meta.env.VITE_ELEVENLABS_KEY
    if (!key) {
      setError('Missing ElevenLabs API key!')
      return
    }

    fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': sk_ac7ddd066774f2d09c4851965752b7af2b74ddf31599fb36
      }
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    })
    .then(data => {
      // data.voices is your array of { voice_id, name, preview_url, ... }
      setVoices(data.voices)
      if (data.voices.length) {
        setHovered(data.voices[0].voice_id)
      }
    })
    .catch(err => {
      console.error(err)
      setError('Failed to load voices')
    })
  }, [])

  if (error) return <p className="voices-error">{error}</p>
  if (!voices.length) return <p className="voices-loading">Loading voices…</p>

  const current = voices.find(v => v.voice_id === hovered) || voices[0]

  return (
    <section id="voices" className="voices-section">
      <div className="voices-container">
        {/* left column: list of voice names */}
        <div className="voices-list">
          {voices.map(v => (
            <div
              key={v.voice_id}
              className={`voice-item${hovered === v.voice_id ? ' active' : ''}`}
              onMouseEnter={() => setHovered(v.voice_id)}
            >
              {v.name}
            </div>
          ))}
        </div>

        {/* right column: preview audio player + image */}
        <div className="voice-preview">
          {/* optional avatar if you have one */}
          {current.preview_url && (
            <audio controls src={current.preview_url}>
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </div>
    </section>
  )
}
