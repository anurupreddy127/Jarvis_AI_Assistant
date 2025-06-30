import React, { useEffect, useState } from 'react'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export default function Voices() {
  const [voices, setVoices] = useState([])

  const client = new ElevenLabsClient({
    apiKey: import.meta.env.VITE_ELEVENLABS_KEY
  })

  useEffect(() => {
    client.voices.getAll()
      .then(res => {
        setVoices(res.voices.slice(0, 20))
      })
      .catch(console.error)
  }, [])

  const playVoiceSample = async (voiceId) => {
    try {
      const response = await client.textToSpeech.convert({
        request: {
          voiceId: voiceId,
          text: "Hello! This is a sample of my voice."
        }
      })

      const audioUrl = URL.createObjectURL(response)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      console.error("Error playing voice sample:", error)
    }
  }

  return (
    <div>
      <h2>Pick a voice:</h2>
      <ul>
        {voices.map(v => (
          <li key={v.voice_id}>
            <button onClick={() => playVoiceSample(v.voice_id)}>
              🔊 {v.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
