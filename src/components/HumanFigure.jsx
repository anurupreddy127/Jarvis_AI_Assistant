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

    // 1) Sizes
    const W = container.clientWidth
    const H = container.clientHeight

    // 2) Scene, camera, renderer
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // 3) Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enableZoom    = false
    controls.enablePan     = false
    controls.rotateSpeed   = 0.7

    // 4) Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(5, 10, 7)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-5, -5, 5)
    scene.add(fillLight)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.7)
    rimLight.position.set(-5, 10, -5)
    scene.add(rimLight)

    // 5) Load model
    new GLTFLoader().load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene

        // center & scale
        const box    = new THREE.Box3().setFromObject(model)
        const size   = box.getSize(new THREE.Vector3())
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.8)
        scene.add(model)

        // frame camera
        const scaledH = size.y * 0.8
        camera.position.set(0, 0, scaledH * 1.5)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()

        // 6) Replace meshes with gradient point-cloud
        model.traverse(child => {
          if (child.isMesh) {
            // hide original mesh
            child.material.transparent = true
            child.material.opacity     = 0

            // clone geometry so we can add color attribute
            const geom = child.geometry.clone()
            geom.computeBoundingBox()
            const { min, max } = geom.boundingBox
            const rangeY = max.y - min.y
            const posAttr = geom.attributes.position
            const count = posAttr.count

            // build color array
            const colors = new Float32Array(count * 3)
            for (let i = 0; i < count; i++) {
              const y = posAttr.getY(i)
              const t = (y - min.y) / rangeY  // 0 at bottom, 1 at top
              // lerp gray(0.5)→white(1.0)
              const c = THREE.MathUtils.lerp(0.5, 1.0, t)
              colors[3*i]   = c
              colors[3*i+1] = c
              colors[3*i+2] = c
            }
            geom.setAttribute('color', new THREE.BufferAttribute(colors, 3))

            // create PointsMaterial with vertexColors
            const pointsMat = new THREE.PointsMaterial({
              vertexColors: true,
              size: 0.02,
              sizeAttenuation: true,
              transparent: true,
              opacity: 1.0
            })

            // build points
            const points = new THREE.Points(geom, pointsMat)
            // copy transform
            points.position.copy(child.position)
            points.rotation.copy(child.rotation)
            points.scale.copy(child.scale)
            model.add(points)
          }
        })

        // 7) Render loop
        const animate = () => {
          requestAnimationFrame(animate)
          controls.update()
          renderer.render(scene, camera)
        }
        animate()
      },
      undefined,
      err => console.error('Failed to load bust GLB:', err)
    )

    // cleanup
    return () => {
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
