// src/components/Voices.jsx
import React, { useEffect, useState } from 'react'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export default function Voices() {
  const [voices, setVoices] = useState([])
  const client = new ElevenLabsClient({
    apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY
  })

  useEffect(() => {
    client.voices.getAll()
      .then(res => {
        // res.voices is an array of { voice_id, name, category, ... }
        setVoices(res.voices.slice(0, 20))
      })
      .catch(console.error)
  }, [])

  return (
    <div>
      <h2>Pick a voice:</h2>
      <ul>
        {voices.map(v => (
          <li key={v.voice_id}>{v.name}</li>
        ))}
      </ul>
    </div>
  )
}
