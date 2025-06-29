// src/components/HumanFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import bustUrl from '../assets/human.glb?url'

export default function HumanFigure() {
  const mountRef = useRef(null)
  const modelRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    // 1) sizes
    const W = container.clientWidth
    const H = container.clientHeight

    // 2) scene + camera + renderer
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // 3) lighting
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    hemi.position.set(0, 20, 0)
    scene.add(hemi)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(5, 10, 7)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-5, -5, 5)
    scene.add(fillLight)

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7)
    rimLight.position.set(-5, 10, -5)
    scene.add(rimLight)

    // 4) load model & convert meshes → points
    new GLTFLoader().load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene
        modelRef.current = model

        // center + uniform scale
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.5)  // tweak size here

        // traverse each mesh, hide it, and replace with point cloud
        model.traverse(child => {
          if (child.isMesh) {
            // hide original geometry
            child.material.transparent = true
            child.material.opacity     = 0

            // point-cloud material
            const pointsMat = new THREE.PointsMaterial({
              color:            0x3C3744,  // darker grey – tweak as you like
              size:             0.015,
              sizeAttenuation:  true,
            })

            // build the Points object
            const points = new THREE.Points(child.geometry, pointsMat)
            // apply the mesh’s local transform to the points
            points.applyMatrix4(child.matrix)
            model.add(points)
          }
        })

        scene.add(model)

        // frame camera so the bust fills view vertically
        const sizeY = box.getSize(new THREE.Vector3()).y * model.scale.y
        camera.position.set(0, 0, sizeY * 1.3)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
      },
      undefined,
      err => console.error('Failed to load bust GLB:', err)
    )

    // 5) mouse‐move tracking (no drag)
    let mouseX = 0, mouseY = 0
    const onMouseMove = e => {
      mouseX = (e.clientX / window.innerWidth)  * 2 - 1
      mouseY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouseMove)

    // 6) render loop
    const animate = () => {
      requestAnimationFrame(animate)
      if (modelRef.current) {
        // subtle follow: yaw on X movement, pitch on Y movement
        modelRef.current.rotation.y = mouseX * 0.3
        modelRef.current.rotation.x = mouseY * 0.15
      }
      renderer.render(scene, camera)
    }
    animate()

    // cleanup
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
