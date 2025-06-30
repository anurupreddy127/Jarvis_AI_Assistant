// src/components/VoiceSphere.jsx
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function VoiceSphere() {
  const mountRef = useRef()
  const [voices, setVoices] = useState([])
  const audioMap = useRef({})

  // 1) Fetch voices and preload audio
  useEffect(() => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_KEY
    if (!apiKey) {
      console.error("Missing ElevenLabs API key")
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
          audio.load()
          audioMap.current[v.id] = audio
        })
      })
      .catch(err => console.error(err))
  }, [])

  // 2) Unlock audio on first user gesture
  useEffect(() => {
    function unlock() {
      Object.values(audioMap.current).forEach(audio => {
        audio.volume = 0
        audio.play().catch(()=>{}).then(() => audio.pause())
        audio.volume = 1
      })
      window.removeEventListener('pointerdown', unlock)
    }
    window.addEventListener('pointerdown', unlock)
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  // 3) three.js + click-to-play
  useEffect(() => {
    if (!mountRef.current || voices.length === 0) return

    const width  = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight

    // scene, camera, renderer
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(50, width/height, 0.1, 100)
    camera.position.set(0, 0, 10)
    camera.lookAt(0,0,0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // build sphere of text‐sprites
    const group  = new THREE.Group()
    const R      = 3
    const FONT_SIZE   = 8
    const FONT_FAMILY = 'Audiowide, Arial, sans-serif'
    const SPRITE_SCALE= 25

    voices.forEach((v,i) => {
      const phi   = Math.acos(1 - 2*(i + 0.5)/voices.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const x     = Math.sin(phi)*Math.cos(theta)*R
      const y     = Math.sin(phi)*Math.sin(theta)*R
      const z     = Math.cos(phi)*R

      // HiDPI canvas
      const dpr = window.devicePixelRatio || 1
      const canvas = document.createElement('canvas')
      const ctx    = canvas.getContext('2d')
      ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`
      const metrics = ctx.measureText(v.name)
      const w       = Math.ceil(metrics.width)
      const h       = Math.ceil(FONT_SIZE * 1.2)

      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`
      ctx.fillStyle = '#3C3744'
      ctx.fillText(v.name, 0, FONT_SIZE * 0.9)

      const tex      = new THREE.CanvasTexture(canvas)
      tex.minFilter  = THREE.LinearFilter
      tex.magFilter  = THREE.LinearFilter
      const mat      = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sprite   = new THREE.Sprite(mat)
      sprite.position.set(x, y, z)
      sprite.scale.set(w/SPRITE_SCALE, FONT_SIZE/SPRITE_SCALE, 1)
      sprite.userData = { voiceId: v.id }
      group.add(sprite)
    })

    scene.add(group)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dir = new THREE.DirectionalLight(0xffffff, 0.5)
    dir.position.set(5,5,5)
    scene.add(dir)

    // raycaster + mouse vector
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()

    function onClick(e) {
      // update mouse coords
      mouse.x = (e.clientX / width) * 2 - 1
      mouse.y = -(e.clientY / height) * 2 + 1

      // raycast once
      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(group.children)

      if (hits.length > 0) {
        const sprite = hits[0].object
        const id     = sprite.userData?.voiceId
        const audio  = audioMap.current[id]
        if (audio) {
          audio.currentTime = 0
          audio.play().catch(()=>{})
        }
      }
    }
    window.addEventListener('pointerdown', onClick)

    // animate: just rotate + render
    const animate = () => {
      requestAnimationFrame(animate)
      group.rotation.y += 0.001
      renderer.render(scene, camera)
    }
    animate()

    // cleanup
    return () => {
      window.removeEventListener('pointerdown', onClick)
      renderer.dispose()
      if (mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [voices])

  return <div ref={mountRef} style={{ width:'100%', height:'100vh' }} />
}
