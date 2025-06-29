// src/components/BrainFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import brainUrl from '../assets/brain.glb?url'

export default function BrainFigure() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // — Scene, camera, renderer
    const scene    = new THREE.Scene()
    const W        = container.clientWidth
    const H        = container.clientHeight
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    camera.position.set(0, 0, 4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // — Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))                 // soft overall light
    const dir = new THREE.DirectionalLight(0xffffff, 1.0)           // key light
    dir.position.set(5, 10, 7)
    scene.add(dir)

    // — Load GLB
    new GLTFLoader().load(
      brainUrl,
      (gltf) => {
        // center & scale the entire gltf.scene
        const root = gltf.scene
        const box  = new THREE.Box3().setFromObject(root)
        const center = box.getCenter(new THREE.Vector3())
        root.position.sub(center)
        root.scale.setScalar(0.8)   // tweak global brain size here

        // convert each mesh → points
        root.traverse(child => {
          if (!child.isMesh) return

          // optionally hide the original mesh
          child.visible = false

          // clone geometry and bake in world matrix
          const geo = child.geometry.clone().applyMatrix4(child.matrixWorld)

          // pick your dot color & size
          const mat = new THREE.PointsMaterial({
            color: 0x3D52D5,      // brain-blue
            size: 0.015,          // dot size in world units
            sizeAttenuation: true
          })

          // build the Points cloud
          const points = new THREE.Points(geo, mat)
          scene.add(points)
        })

        // now add the (hidden) root so any children transforms apply, if needed:
        scene.add(root)
      },
      undefined,
      err => console.error('Brain load error:', err)
    )

    // — Render loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // — Cleanup
    return () => {
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100vh', position: 'relative' }}
    />
  )
}
