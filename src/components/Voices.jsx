// src/components/VoiceSphere.jsx
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function VoiceSphere() {
  const mountRef = useRef()
  const [voices, setVoices] = useState([])
  const audioMap = useRef({})

  // 1) Fetch voice list & preload audio
  useEffect(() => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_KEY
    if (!apiKey) {
      console.error("Missing ElevenLabs API key (VITE_ELEVENLABS_KEY)")
      return
    }

    fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey }
    })
      .then(res => res.json())
      .then(data => {
        const list = data.voices.slice(0, 20)
        setVoices(list)
        list.forEach(v => {
          const audio = new Audio(v.sampleUrl)
          audio.crossOrigin = 'anonymous'
          audio.volume     = 1
          audio.load()
          audioMap.current[v.id] = audio
        })
      })
      .catch(err => console.error('ElevenLabs fetch failed:', err))
  }, [])

  // 2) Three.js + hover-play
  useEffect(() => {
    if (!mountRef.current || voices.length === 0) return

    // scene, camera, renderer
    const width  = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 100)
    camera.position.set(0, 0, 10)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // build sphere of text-sprites
    const group = new THREE.Group()
    const R = 3
    const FONT_SIZE = 8
    const FONT_FAMILY = 'Audiowide, Arial, sans-serif'
    const SPRITE_SCALE = 25

    voices.forEach((v, i) => {
      const phi   = Math.acos(1 - 2*(i + 0.5)/voices.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const x     = Math.sin(phi)*Math.cos(theta)*R
      const y     = Math.sin(phi)*Math.sin(theta)*R
      const z     = Math.cos(phi)*R

      // Hi-DPI text canvas
      const dpr    = window.devicePixelRatio || 1
      const canvas = document.createElement('canvas')
      const ctx    = canvas.getContext('2d')
      ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`
      const metrics = ctx.measureText(v.name)
      const textWidth  = Math.ceil(metrics.width)
      const textHeight = Math.ceil(FONT_SIZE * 1.2)

      canvas.width  = textWidth * dpr
      canvas.height = textHeight * dpr
      ctx.scale(dpr, dpr)
      ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`
      ctx.fillStyle = '#3C3744'
      ctx.fillText(v.name, 0, FONT_SIZE * 0.9)

      const texture  = new THREE.CanvasTexture(canvas)
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const sprite   = new THREE.Sprite(material)

      sprite.position.set(x, y, z)
      sprite.scale.set(textWidth / SPRITE_SCALE, FONT_SIZE / SPRITE_SCALE, 1)
      sprite.userData = { voiceId: v.id }
      group.add(sprite)
    })

    scene.add(group)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dir = new THREE.DirectionalLight(0xffffff, 0.5)
    dir.position.set(5, 5, 5)
    scene.add(dir)

    // raycaster & mouse coords
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()
    function onPointerMove(e) {
      mouse.x = (e.clientX / width) * 2 - 1
      mouse.y = -(e.clientY / height) * 2 + 1
    }
    window.addEventListener('pointermove', onPointerMove)

    // render loop
    const animate = () => {
      requestAnimationFrame(animate)
      group.rotation.y += 0.001

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(group.children)

      group.children.forEach(sprite => {
        const hit   = hits[0]?.object === sprite
        const audio = audioMap.current[sprite.userData.voiceId]
        if (hit) {
          // debug
          console.log('hovering over', sprite.userData.voiceId)
          if (audio) audio.play().catch(err => console.warn('Audio play failed:', err))
        } else {
          if (audio) {
            audio.pause()
            audio.currentTime = 0
          }
        }
      })

      renderer.render(scene, camera)
    }
    animate()

    // cleanup
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      renderer.dispose()
      if (mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [voices])

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />
}
