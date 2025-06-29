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

    // 1) scene + camera + renderer
    const scene    = new THREE.Scene()
    const W        = container.clientWidth
    const H        = container.clientHeight
    const camera   = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000)
    camera.position.set(0, 0, 4)          // <-- FIXED camera distance
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // 2) lighting (same as before)
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6)
    hemi.position.set(0, 20, 0)
    scene.add(hemi)
    const keyLight  = new THREE.DirectionalLight(0xffffff, 1.0)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    const rimLight  = new THREE.DirectionalLight(0xffffff, 0.7)
    keyLight.position.set(5, 10, 7)
    fillLight.position.set(-5, -5, 5)
    rimLight.position.set(-5, 10, -5)
    scene.add(keyLight, fillLight, rimLight)

    // 3) load GLB & convert meshes → points
    new GLTFLoader().load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene
        modelRef.current = model

        // center
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)

        // scale down or up here and you'll *see* it change
        model.scale.setScalar(0.8)    // try 0.5 for half size, 1.5 for bigger, etc.

        // replace each mesh with a point cloud
        model.traverse(child => {
          if (child.isMesh) {
            child.material.transparent = true
            child.material.opacity     = 0

            const pointsMat = new THREE.PointsMaterial({
              color: 0x3C3744,    // darker grey
              size:  0.02,
              sizeAttenuation: true,
            })
            const points = new THREE.Points(child.geometry, pointsMat)
            points.applyMatrix4(child.matrix)
            model.add(points)
          }
        })

        scene.add(model)
      },
      undefined,
      err => console.error(err)
    )

    // 4) mouse tracking
    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX / window.innerWidth)  * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouse)

    // 5) render loop
    const animate = () => {
      requestAnimationFrame(animate)
      if (modelRef.current) {
        // very gentle follow
        modelRef.current.rotation.y = mx * 0.3
        modelRef.current.rotation.x = my * 0.15
      }
      renderer.render(scene, camera)
    }
    animate()

    // cleanup
    return () => {
      window.removeEventListener('mousemove', onMouse)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
