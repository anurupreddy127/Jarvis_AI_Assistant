// src/components/Voices.jsx
import React, { useEffect, useState } from 'react'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export default function Voices() {
  const [voices, setVoices] = useState([])
  const [audio, setAudio] = useState(null)

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
        voiceId: voiceId,
        text: "Hi, I'm your Jarvis assistant. This is a voice sample.",
        modelId: 'eleven_multilingual_v2', // or 'eleven_multilingual_v1'
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.5
        }
      })

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Stop existing audio
      if (audio) {
        audio.pause()
      }

      const newAudio = new Audio(audioUrl)
      setAudio(newAudio)
      newAudio.play()
    } catch (err) {
      console.error("Error playing voice sample:", err)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Pick a voice to hear a sample:</h2>
      <ul className="space-y-2">
        {voices.map(v => (
          <li
            key={v.voice_id}
            onClick={() => playVoiceSample(v.voice_id)}
            className="cursor-pointer text-blue-600 hover:underline"
          >
            🔊 {v.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
