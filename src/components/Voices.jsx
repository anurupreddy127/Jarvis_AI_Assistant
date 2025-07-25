import React, { useEffect, useState, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

function VoiceLabel({ position, name, url }) {
  const { camera } = useThree()
  const ref = useRef()

  // Rotate the label to face the camera every frame
  useFrame(() => {
    if (ref.current) {
      ref.current.lookAt(camera.position)
    }
  })

  const handleClick = () => {
    const audio = new Audio(url)
    audio.play()
  }

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={0.5}
      color="white"
      onClick={handleClick}
      anchorX="center"
      anchorY="middle"

    >
      {name}
    </Text>
  )
}

function SphereOfVoices({ voices }) {
  const radius = 5
  const voiceCount = voices.length

  const positions = voices.map((_, i) => {
    const phi = Math.acos(-1 + (2 * i) / voiceCount)
    const theta = Math.sqrt(voiceCount * Math.PI) * phi
    return new THREE.Vector3(
      radius * Math.cos(theta) * Math.sin(phi),
      radius * Math.sin(theta) * Math.sin(phi),
      radius * Math.cos(phi)
    )
  })

  return (
    <>
      {voices.map((voice, i) => (
        <VoiceLabel
          key={voice.voice_id}
          name={voice.name}
          url={voice.preview_url}
          position={positions[i]}
        />
      ))}
    </>
  )
}

export default function VoiceSphere() {
  const [voices, setVoices] = useState([])

  useEffect(() => {
    const key = import.meta.env.VITE_ELEVENLABS_KEY
    if (!key) return

    fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': key }
    })
      .then(res => res.json())
      .then(data => setVoices(data.voices.slice(0, 50))) // limit for now
      .catch(console.error)
  }, [])

  return (
    <section
      id="voices"
      style={{
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        background: 'black',
        color: 'white',
        fontFamily: "'Audiowide', cursive"
      }}
    >
      {/* Heading */}
      <h1 style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '2rem',
        zIndex: 10,
      }}>
        Explore ElevenLabs Voices
      </h1>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 12], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
        <SphereOfVoices voices={voices} />
      </Canvas>
    </section>
  )
}

