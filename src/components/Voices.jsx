// src/components/VoiceSphere.jsx
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Voices() {
  const mountRef = useRef()
  const [voices, setVoices] = useState([])
  const audioMap = useRef({})

  useEffect(() => {
      const apiKey = import.meta.env.VITE_ELEVENLABS_KEY
    if (!apiKey) {
      console.error("Missing ElevenLabs API key (VITE_ELEVEN_LABS_KEY)")
      return
    }
    // 1) fetch voices
    fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    })
    .then(res => res.json())
    .then(data => {
      const list = data.voices.slice(0, 20) // pick as many as you like
      setVoices(list)
      list.forEach(v => {
        const a = new Audio(v.sampleUrl)
        a.load()
        audioMap.current[v.id] = a
      })
    })
  }, [])

  useEffect(() => {
    if (!mountRef.current || voices.length === 0) return

    // 2) three.js setup
    const width = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 100)
    camera.position.set(0, 0, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // 3) create group of text‐sprites on a sphere
    const group = new THREE.Group()
    const radius = 3
// … in your Voices component …

voices.forEach((v,i) => {
  // … compute x,y,z …
  const FONT_SIZE   = 48
  const FONT_FAMILY = 'Audiowide, Arial, sans-serif'

  // 1) draw into canvas
  const canvas = document.createElement('canvas')
  const ctx    = canvas.getContext('2d')
  ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`

  // measure & resize
  const metrics   = ctx.measureText(v.name)
  const textWidth = Math.ceil(metrics.width)
  canvas.width    = textWidth
  canvas.height   = Math.ceil(FONT_SIZE * 1.2)

  // redraw text
  ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`
  ctx.fillStyle = '#3C3744'
  ctx.fillText(v.name, 0, FONT_SIZE * 0.9)

  // 2) make sprite
  const tex    = new THREE.CanvasTexture(canvas)
  const mat    = new THREE.SpriteMaterial({ map: tex, transparent: true })
  const sprite = new THREE.Sprite(mat)

  // 3) scale in world‐space
  const SPRITE_SCALE = 30
  sprite.scale.set(
    textWidth  / SPRITE_SCALE,
    FONT_SIZE  / SPRITE_SCALE,
    1
  )

  sprite.position.set(x, y, z)
  sprite.userData    = { voiceId: v.id }
  group.add(sprite)
})

    scene.add(group)

    // 4) lights + controls (optional)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dir = new THREE.DirectionalLight(0xffffff, 0.5)
    dir.position.set(5,5,5)
    scene.add(dir)

    // raycaster for hover
    const ray = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function onMove(e) {
      mouse.x = (e.clientX/width)*2 -1
      mouse.y = -(e.clientY/height)*2 +1
    }
    window.addEventListener('pointermove', onMove)

    // 5) animate
    const animate = () => {
      requestAnimationFrame(animate)

      // rotate sphere
      group.rotation.y += 0.001

      // raycast
      ray.setFromCamera(mouse, camera)
      const hits = ray.intersectObjects(group.children)
      group.children.forEach(s => {
        if (hits.length && hits[0].object === s) {
          s.scale.set(1.5,1.5,1)
          audioMap.current[s.userData.voiceId]?.play()
        } else {
          s.scale.set(1,1,1)
          audioMap.current[s.userData.voiceId]?.pause()
           const audio = audioMap.current[s.userData.voiceId]
         if (audio) audio.currentTime = 0
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    // cleanup
    return () => {
      window.removeEventListener('pointermove', onMove)
      mountRef.current.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [voices])

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
}
