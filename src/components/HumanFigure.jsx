// src/components/HumanFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import bustUrl from '../assets/human.glb?url'

export default function HumanFigure() {
  const mountRef = useRef(null)
  const modelRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const W = container.clientWidth
    const H = container.clientHeight

    // Scene / camera / renderer
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // Orbit controls (for a little inertia)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enableZoom    = false
    controls.enablePan     = false

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    hemi.position.set(0, 20, 0)
    scene.add(hemi)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1)
    keyLight.position.set(5, 10, 7)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-5, -5, 5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7)
    rimLight.position.set(-5, 10, -5)
    scene.add(rimLight)

    // Mouse tracking variables
    let mouseX = 0
    let mouseY = 0

    function handlePointerMove(e) {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', handlePointerMove)

    // Load GLB
    const loader = new GLTFLoader()
    loader.load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene
        // Center & scale
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.8)
        scene.add(model)
        modelRef.current = model

        // Frame camera
        const size     = box.getSize(new THREE.Vector3())
        const distance = size.y * 0.6
        camera.position.set(0, 0, distance)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate)

          // Lerp rotation toward mouse
          if (modelRef.current) {
            const targetY = mouseX * Math.PI * 0.2  // ±36°
            const targetX = mouseY * Math.PI * 0.1  // ±18°
            modelRef.current.rotation.y += (targetY - modelRef.current.rotation.y) * 0.05
            modelRef.current.rotation.x += (targetX - modelRef.current.rotation.x) * 0.05
          }

          controls.update()
          renderer.render(scene, camera)
        }
        animate()
      },
      undefined,
      (err) => console.error('Model failed to load:', err)
    )

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
