// src/components/Voices.jsx
import React, { useEffect, useState, useRef } from 'react'

export default function Voices() {
  const [voices, setVoices]         = useState([])
  const [selectedVoiceId, setVoice] = useState(null)
  const audioRef                    = useRef()

  useEffect(() => {
    const key = import.meta.env.VITE_ELEVENLABS_KEY
    if (!key) {
      console.error('⚠️ Missing ElevenLabs API key! Set VITE_ELEVENLABS_KEY in your .env')
      return
    }

    fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': key }
    })
      .then(res => {
        console.log('Fetch status:', res.status)
        return res.json()
      })
      .then(json => {
        console.log('Got ElevenLabs voices:', json.voices)
        // use voice_id, not id
        setVoices(json.voices.slice(0, 20))
      })
      .catch(err => console.error('Fetch error:', err))
  }, [])

  // whenever selectedVoiceId changes, update audio.src, load, and play
  useEffect(() => {
    if (!selectedVoiceId || !voices.length) return

    const voice = voices.find(v => v.voice_id === selectedVoiceId)
    if (!voice) {
      console.warn('Selected voice not found:', selectedVoiceId)
      return
    }

    console.log('Playing sample for voice:', voice.name, voice.voice_id)
    if (audioRef.current) {
      audioRef.current.src = voice.sampleUrl
      audioRef.current.load()                // ensure it picks up the new src
      audioRef.current
        .play()
        .catch(err => console.error('Audio play() failed:', err))
    }
  }, [selectedVoiceId, voices])

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2>Pick a voice</h2>
        {voices.map(v => (
          <div
            key={v.voice_id}    // <-- use voice_id as the key
            onClick={() => {
              console.log('Clicked voice:', v.voice_id, v.name)
              setVoice(v.voice_id)
            }}
            style={{
              ...styles.voiceItem,
              fontWeight: voices.voice_id === selectedVoiceId ? 'bold' : 'normal'
            }}
          >
            {v.name}
          </div>
        ))}
      </aside>

      <main style={styles.main}>
        <h2>Sample Player</h2>
        <audio
          ref={audioRef}
          controls
          style={{ width: '100%', marginTop: 16 }}
        />
      </main>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    background: '#FBFFF1',
    color: '#3C3744'
  },
  sidebar: {
    width: 200,
    borderRight: '1px solid #ddd',
    padding: 16,
    boxSizing: 'border-box',
    overflowY: 'auto'
  },
  voiceItem: {
    padding: '8px 4px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  main: {
    flex: 1,
    padding: 16,
    boxSizing: 'border-box'
  }
}
