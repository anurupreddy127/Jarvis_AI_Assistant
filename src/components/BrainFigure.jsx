// src/components/BrainFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import brainUrl from '../assets/brain.glb?url'

export default function BrainFigure() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    // — Scene, camera, renderer
    const scene    = new THREE.Scene()
    const { clientWidth: W, clientHeight: H } = mountRef.current
    const camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000)
    camera.position.set(0, 0, 8)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // — Simple hemisphere + directional light
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(5, 10, 7)
    scene.add(dir)

    // — Load brain GLB
    new GLTFLoader().load(
      brainUrl,
      (gltf) => {
        const model = gltf.scene

        // center & scale
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.001)

        // convert each mesh to a point cloud
        model.traverse(child => {
          if (!child.isMesh) return

          // bake world transform into a clone of the geometry
          const geo = child.geometry.clone().applyMatrix4(child.matrixWorld)
          const mat = new THREE.PointsMaterial({
            color: 0x3D52D5,
            size: 0.02,
            sizeAttenuation: true
          })
          const points = new THREE.Points(geo, mat)
          scene.add(points)
        })
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
      if (mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
