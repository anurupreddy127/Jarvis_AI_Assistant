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
    const container = mountRef.current!
    const W = container.clientWidth
    const H = container.clientHeight

    // 1) Scene / camera / renderer
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // 2) OrbitControls (for inertia, but disable zoom/pan)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enableZoom    = false
    controls.enablePan     = false

    // 3) Lights
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

    // 4) Mouse tracking
    let mouseX = 0, mouseY = 0
    window.addEventListener('pointermove', (e) => {
      mouseX = ( e.clientX / window.innerWidth  ) * 2 - 1
      mouseY = ( e.clientY / window.innerHeight ) * 2 - 1
    })

    // 5) Load model
    new GLTFLoader().load(bustUrl, (gltf) => {
      const model = gltf.scene
      model.scale.setScalar(0.8)

      // center
      const box    = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)

      scene.add(model)
      modelRef.current = model

      // position camera so the head fills the view
      const size = box.getSize(new THREE.Vector3())
      const distance = size.y * 0.6
      camera.position.set(0, 0, distance)
      camera.lookAt(0, 0, 0)
      camera.updateProjectionMatrix()

      // 6) Animate
      const animate = () => {
        requestAnimationFrame(animate)

        // smoothly rotate model towards mouse
        if (modelRef.current) {
          const targetRotY = mouseX * Math.PI * 0.2     // ±36°
          const targetRotX = mouseY * Math.PI * 0.1     // ±18°
          modelRef.current.rotation.y += (targetRotY - modelRef.current.rotation.y) * 0.05
          modelRef.current.rotation.x += (targetRotX - modelRef.current.rotation.x) * 0.05
        }

        controls.update()
        renderer.render(scene, camera)
      }
      animate()
    },
    undefined,
    (err) => console.error('Failed to load model:', err)
    )

    // cleanup
    return () => {
      window.removeEventListener('pointermove', () => {})
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
