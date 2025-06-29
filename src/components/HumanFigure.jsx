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

    const W = container.clientWidth
    const H = container.clientHeight

    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enableZoom = false
    controls.enablePan  = false
    controls.rotateSpeed = 0.7

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(5,10,7); scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-5,-5,5); scene.add(fill)
    const rim = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-5,10,-5); scene.add(rim)

    new GLTFLoader().load(
      bustUrl,
      gltf => {
        const model = gltf.scene
        const box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.8)
        scene.add(model)

        // frame camera
        const scaledH = size.y * 0.8
        camera.position.set(0,0, scaledH * 1.5)
        camera.lookAt(0,0,0)
        camera.updateProjectionMatrix()

        // gradient from dark gray to mid-gray
        model.traverse(child => {
          if (!child.isMesh) return

          child.material.transparent = true
          child.material.opacity = 0

          const geom = child.geometry.clone()
          geom.computeBoundingBox()
          const { min, max } = geom.boundingBox
          const rangeY = max.y - min.y
          const pos = geom.attributes.position
          const count = pos.count
          
          const colors = new Float32Array(count * 3)
          for (let i = 0; i < count; i++) {
            const y = pos.getY(i)
            const t = (y - min.y) / rangeY

            // darken endpoints: 0.2 (20% gray) → 0.6 (60% gray)
            const c = THREE.MathUtils.lerp(0.2, 0.6, t)
            colors[3*i]   = c
            colors[3*i+1] = c
            colors[3*i+2] = c
          }
          geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))

          const mat = new THREE.PointsMaterial({
            vertexColors: true,
            size: 0.02,
            sizeAttenuation: true,
            transparent: true,
            opacity: 1.0
          })

          const points = new THREE.Points(geom, mat)
          points.position.copy(child.position)
          points.rotation.copy(child.rotation)
          points.scale.copy(child.scale)
          model.add(points)
        })

        const animate = () => {
          requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()
      },
      undefined,
      console.error
    )

    return () => {
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
