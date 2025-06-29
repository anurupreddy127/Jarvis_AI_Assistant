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

    // 1) Scene / camera / renderer
    const scene    = new THREE.Scene()
    const camera   = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.appendChild(renderer.domElement)

    // 2) OrbitControls for smooth inertia
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.enableZoom    = false
    controls.enablePan     = false
    controls.rotateSpeed   = 0.7

    // 3) Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const key   = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(5,10,7); scene.add(key)
    const fill  = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-5,-5,5); scene.add(fill)
    const rim   = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-5,10,-5); scene.add(rim)

    // 4) Mouse tracking
    let mouseX = 0, mouseY = 0
    const onPointerMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1
      mouseY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onPointerMove)

    // 5) Load model
    new GLTFLoader().load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene

        // center & scale
        const bbox   = new THREE.Box3().setFromObject(model)
        const center = bbox.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.8)                          // same as before
        scene.add(model)
        modelRef.current = model

        // convert each mesh to a Points cloud
        model.traverse((child) => {
          if (child.isMesh) {
            const geom     = child.geometry
            const pointsM  = new THREE.PointsMaterial({
              color:    0x888888,
              size:     0.02,
              transparent: true,
              opacity:  1.0,
              sizeAttenuation: true
            })
            const points   = new THREE.Points(geom, pointsM)
            points.applyMatrix4(child.matrix) // copy transform
            model.add(points)
            child.visible = false
          }
        })

        // frame the camera to fit the scaled model
        const newBox = new THREE.Box3().setFromObject(model)
        const size   = newBox.getSize(new THREE.Vector3())
        camera.position.set(0, 0, size.y * 1.2)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()

        // animate
        const animate = () => {
          requestAnimationFrame(animate)
          // smooth mouse-follow
          const targetY = mouseX * Math.PI * 0.2
          const targetX = mouseY * Math.PI * 0.1
          model.rotation.y += (targetY - model.rotation.y) * 0.05
          model.rotation.x += (targetX - model.rotation.x) * 0.05

          controls.update()
          renderer.render(scene, camera)
        }
        animate()
      },
      undefined,
      (err) => console.error('Failed to load GLB:', err)
    )

    // 6) Cleanup
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
