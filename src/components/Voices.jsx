// src/components/VoiceSphere.jsx
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function Voices() {
  const mountRef = useRef()
  const [voices, setVoices] = useState([])
  const audioMap = useRef({})

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
        const a = new Audio(v.sampleUrl)
        a.load()
        audioMap.current[v.id] = a
      })
    })
  }, [])

  useEffect(() => {
    if (!mountRef.current || voices.length === 0) return

    // Scene + camera + renderer
    const width  = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 100)
    camera.position.set(0, 0, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // Build the sphere of text‐sprites
    const group  = new THREE.Group()
    const R      = 4               // sphere radius
    const FONT_SIZE   = 12
    const FONT_FAMILY = 'Audiowide, Arial, sans-serif'
    const SPRITE_SCALE = 25         // tweak to enlarge/shrink labels

    voices.forEach((v, i) => {
      // spherical distribution (golden angle)
      const phi   = Math.acos(1 - 2*(i + 0.5)/voices.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      const x     = Math.sin(phi) * Math.cos(theta) * R
      const y     = Math.sin(phi) * Math.sin(theta) * R
      const z     = Math.cos(phi) * R

      // draw text into canvas
      const canvas = document.createElement('canvas')
      const ctx    = canvas.getContext('2d')
      ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`
      const metrics = ctx.measureText(v.name)
      const textWidth = Math.ceil(metrics.width)
      canvas.width  = textWidth
      canvas.height = Math.ceil(FONT_SIZE * 1.2)
      ctx.font      = `${FONT_SIZE}px ${FONT_FAMILY}`
      ctx.fillStyle = '#3C3744'
      ctx.fillText(v.name, 0, FONT_SIZE * 0.9)

      // create sprite
      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
      const sprite = new THREE.Sprite(material)
      sprite.position.set(x, y, z)
      sprite.scale.set(
        textWidth / SPRITE_SCALE,
        FONT_SIZE / SPRITE_SCALE,
        1
      )
      sprite.userData = { voiceId: v.id }
      group.add(sprite)
    })

    scene.add(group)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dir = new THREE.DirectionalLight(0xffffff, 0.5)
    dir.position.set(5, 5, 5)
    scene.add(dir)

    // raycaster for hover‐play
    const raycaster = new THREE.Raycaster()
    const mouse     = new THREE.Vector2()
    function onPointerMove(e) {
      mouse.x = (e.clientX / width)  * 2 - 1
      mouse.y = -(e.clientY / height) * 2 + 1
    }
    window.addEventListener('pointermove', onPointerMove)

    // animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      group.rotation.y += 0.001

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObjects(group.children)
      group.children.forEach(sprite => {
        const isHovered = hits[0]?.object === sprite
        sprite.scale.set(
          (isHovered ? 1.5 : 1) * (sprite.scale.x),
          (isHovered ? 1.5 : 1) * (sprite.scale.y),
          1
        )
        const audio = audioMap.current[sprite.userData.voiceId]
        if (isHovered) audio?.play()
        else {
          audio?.pause()
          if (audio) audio.currentTime = 0
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

  return <div ref={mountRef} style={{ width:'100%', height:'100vh' }} />
}
