// src/components/HumanFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import bustUrl from '../assets/human.glb?url'

export default function HumanFigure() {
  const mountRef = useRef(null)
  const modelRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    gsap.registerPlugin(ScrollTrigger)

    // 1) Three.js setup
    const scene    = new THREE.Scene()
    const W        = mountRef.current.clientWidth
    const H        = mountRef.current.clientHeight
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    camera.position.set(0, 0, 4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // 2) Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const key   = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(5,10,7)
    const fill  = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-5,-5,5)
    const rim   = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-5,10,-5)
    scene.add(key, fill, rim)

    // 3) Load model + point cloud
    new GLTFLoader().load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene
        modelRef.current = model

        // center & scale
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.8)

const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64)
const spherePositions = sphereGeometry.getAttribute('position').array

let headPositions = []
let morphTargets = []

model.traverse(child => {
  if (child.isMesh) {
    const positions = child.geometry.getAttribute('position')
    const count = positions.count

    headPositions.push(positions.array.slice()) // original shape

    // Match sphere point count or pad/repeat
    const sphere = new Float32Array(positions.count * 3)
    for (let i = 0; i < positions.count; i++) {
      const j = i * 3
      const k = j % spherePositions.length
      sphere[j]     = spherePositions[k]
      sphere[j + 1] = spherePositions[k + 1]
      sphere[j + 2] = spherePositions[k + 2]
    }

    morphTargets.push(sphere)

    const material = new THREE.PointsMaterial({
      color: 0x3C3744,
      size: 0.01,
      sizeAttenuation: true,
    })

    const points = new THREE.Points(child.geometry.clone(), material)
    points.geometry.setAttribute('morphTarget', new THREE.BufferAttribute(sphere, 3))
    child.visible = false // hide original mesh
    model.add(points)

    points.userData.original = positions.array.slice()
  }
})


        scene.add(model)

        // 4) ScrollTrigger — move model.y from 0 → 3 as .hero → #about
        gsap.to(model.position, {
          y: -0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'bottom bottom',
            endTrigger: '#about',
            end: 'bottom top',
            scrub: true,
          }
        })
      },
      undefined,
      err => console.error('GLTF load error:', err)
    )

    // 5) Mouse-follow
    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX / window.innerWidth)  * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouse)

    // 6) Render loop
    const animate = () => {
      requestAnimationFrame(animate)
      const m = modelRef.current
      if (m) {
        m.rotation.y = mx * 0.3
        m.rotation.x = my * 0.15
      }
      renderer.render(scene, camera)
    }
    animate()

    // cleanup
    return () => {
      window.removeEventListener('mousemove', onMouse)
     renderer.dispose()
     // only remove the canvas if it's still mounted
     if (
       mountRef.current && 
       renderer.domElement.parentNode === mountRef.current
     ) {
       mountRef.current.removeChild(renderer.domElement)
     }
   ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
