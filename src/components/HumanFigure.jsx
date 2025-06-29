// src/components/HumanFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import bustUrl from '../assets/human.glb?url'

export default function HumanFigure() {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // sizes
    const W = container.clientWidth
    const H = container.clientHeight

    // 1) Scene, camera, renderer
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // 2) Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping   = true
    controls.dampingFactor   = 0.1
    controls.enableZoom      = false
    controls.enablePan       = false
    controls.rotateSpeed     = 0.7

    // 3) Lights
    // Hemisphere for soft fill from all around
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    hemi.position.set(0, 20, 0)
    scene.add(hemi)

    // Key / Fill / Rim
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(5, 10, 7)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-5, -5, 5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7)
    rimLight.position.set(-5, 10, -5)
    scene.add(rimLight)

    // 4) Load the bust GLB
    new GLTFLoader().load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene

        // compute bbox + center
        const box    = new THREE.Box3().setFromObject(model)
        const size   = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())

        // center model at origin
        model.position.sub(center)

        // uniform scale = 2
        model.scale.setScalar(1.5)

        scene.add(model)

        // frame camera: back far enough so height ~100% view
        const scaledH = size.y * 2
        camera.position.set(0, 0, scaledH * 0.6)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()

        // replace mesh with point cloud
        model.traverse(child => {
          if (child.isMesh) {
            child.material.transparent = true
            child.material.opacity = 0

            const pointsMat = new THREE.PointsMaterial({
              color: 0xffffff,
              size: 0.02,
              sizeAttenuation: true,
            })
            const points = new THREE.Points(child.geometry, pointsMat)
            points.applyMatrix4(child.matrix) // carry over position/rotation/scale
            model.add(points)
          }
        })

        // 5) Animation loop
        const loop = () => {
          requestAnimationFrame(loop)
          controls.update()
          renderer.render(scene, camera)
        }
        loop()
      },
      undefined,
      err => console.error('Failed to load bust GLB:', err)
    )

    // 6) Cleanup
    return () => {
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
