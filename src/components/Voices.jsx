// src/components/VoiceSphere.jsx
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function VoiceSphere() {
  const mountRef = useRef()
  const [voices, setVoices] = useState([])
  const audioMap = useRef({})

  // 1) load ElevenLabs voices
  useEffect(() => {
    const key = import.meta.env.VITE_ELEVENLABS_KEY
    if (!key) {
      console.error("Missing VITE_ELEVENLABS_KEY")
      return
    }
    fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': key }
    })
    .then(r => r.json())
    .then(json => {
      const vs = json.voices.slice(0, 20)
      setVoices(vs)
      vs.forEach(v => {
        const a = new Audio(v.sampleUrl)
        a.crossOrigin = 'anonymous'
        a.load()
        audioMap.current[v.id] = a
      })
    })
    .catch(console.error)
  }, [])

  // 2) three.js + click‐to‐play
  useEffect(() => {
    if (!mountRef.current || voices.length === 0) return

    // basic scene
    const width  = mountRef.current.clientWidth
    const height = mountRef.current.clientHeight
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 100)
    camera.position.set(0, 0, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    mountRef.current.appendChild(renderer.domElement)

    // build labels on a sphere
    const group  = new THREE.Group()
    const R      = 3
    const FS     = 8
    const FF     = 'Audiowide, Arial'
    const SCALE  = 25

    voices.forEach((v,i) => {
      // spherical coords
      const phi   = Math.acos(1 - 2*(i+0.5)/voices.length)
      const theta = Math.PI*(1+Math.sqrt(5))*i
      const x     = Math.sin(phi)*Math.cos(theta)*R
      const y     = Math.sin(phi)*Math.sin(theta)*R
      const z     = Math.cos(phi)*R

      // HiDPI canvas
      const dpr   = window.devicePixelRatio||1
      const cnv   = document.createElement('canvas')
      const ctx   = cnv.getContext('2d')
      ctx.font    = `${FS}px ${FF}`
      const w     = Math.ceil(ctx.measureText(v.name).width)
      const h     = Math.ceil(FS*1.2)
      cnv.width   = w*dpr; cnv.height = h*dpr
      ctx.scale(dpr, dpr)
      ctx.font    = `${FS}px ${FF}`
      ctx.fillStyle = '#3C3744'
      ctx.fillText(v.name, 0, FS*0.9)

      const tex  = new THREE.CanvasTexture(cnv)
      tex.minFilter = THREE.LinearFilter
      tex.magFilter = THREE.LinearFilter

      const mat  = new THREE.SpriteMaterial({ map: tex, transparent: true })
      const sp   = new THREE.Sprite(mat)
      sp.position.set(x, y, z)
      sp.scale.set(w/SCALE, FS/SCALE, 1)
      sp.userData = { voiceId: v.id }
      group.add(sp)
    })

    scene.add(group)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const dl = new THREE.DirectionalLight(0xffffff, 0.5)
    dl.position.set(5,5,5)
    scene.add(dl)

    // raycaster for click
    const ray = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function onClick(ev) {
      // get click coords relative to canvas
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((ev.clientX - rect.left) / rect.width)*2 - 1
      mouse.y = -((ev.clientY - rect.top) / rect.height)*2 + 1

      // do the pick
      ray.setFromCamera(mouse, camera)
      const hits = ray.intersectObjects(group.children)
      if (hits.length) {
        const id = hits[0].object.userData.voiceId
        const audio = audioMap.current[id]
        if (audio) {
          audio.currentTime = 0
          audio.play().catch(e=> console.warn('play() failed',e))
        }
      }
    }

    renderer.domElement.addEventListener('pointerdown', onClick)

    // render loop
    const loop = () => {
      group.rotation.y += 0.001
      renderer.render(scene, camera)
      requestAnimationFrame(loop)
    }
    loop()

    // cleanup
    return () => {
      renderer.domElement.removeEventListener('pointerdown', onClick)
      if (mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [voices])

  return <div ref={mountRef} style={{ width:'100%',height:'100vh' }} />
}
