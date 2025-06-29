// src/components/BrainFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import brainUrl from '../assets/brain.glb?url'

export default function BrainFigure() {
  const mountRef = useRef(null)
  const pointsRef = useRef([])

  useEffect(() => {
    if (!mountRef.current) return
    gsap.registerPlugin(ScrollTrigger)

    // 1) Basic Three.js setup
    const scene    = new THREE.Scene()
    const { clientWidth: W, clientHeight: H } = mountRef.current
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    camera.position.set(0, 0, 4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // 2) Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const keyLight  = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(5, 10, 7)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
    fillLight.position.set(-5, -5, 5)
    const rimLight  = new THREE.DirectionalLight(0xffffff, 0.7)
    rimLight.position.set(-5, 10, -5)
    scene.add(keyLight, fillLight, rimLight)

    // 3) Load the brain model and build point cloud
    new GLTFLoader().load(
      brainUrl,
      (gltf) => {
        const model = gltf.scene

        // center & uniform-scale the model
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.8)

        // traverse each mesh, convert to THREE.Points
        model.traverse(child => {
          if (!child.isMesh) return

          // bake the child world matrix into geometry
          const geometry = child.geometry.clone().applyMatrix4(child.matrixWorld)
          const posAttr  = geometry.getAttribute('position')
          const count    = posAttr.count

          // collect target (brain) positions
          const brainPositions = Float32Array.from(posAttr.array)

          // generate random start positions, outside of view
          const startPositions = new Float32Array(brainPositions.length)
          for (let i = 0; i < brainPositions.length; i += 3) {
            // random sphere of radius 5
            const v = new THREE.Vector3().set(
              (Math.random()*2-1) * 5,
              (Math.random()*2-1) * 5,
              (Math.random()*2-1) * 5
            )
            startPositions[i]     = v.x
            startPositions[i + 1] = v.y
            startPositions[i + 2] = v.z
          }

          // replace mesh with points
          const pointsMat = new THREE.PointsMaterial({
            color: 0x3D52D5,
            size: 0.015,
            transparent: true,
            opacity: 1,
            sizeAttenuation: true
          })
          const pointsGeo = new THREE.BufferGeometry()
          pointsGeo.setAttribute('position', new THREE.BufferAttribute(startPositions, 3))
          const points = new THREE.Points(pointsGeo, pointsMat)
          scene.add(points)
          pointsRef.current.push({
            points,
            start: startPositions,
            target: brainPositions
          })
        })

        // 4) ScrollTrigger morph: from scattered → brain
        gsap.to({ t: 0 }, {
          t: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '#features',
            start:   'top bottom',
            end:     'center center',
            scrub:   true,
          },
          onUpdate() {
            const t = this.targets()[0].t
            for (const { points, start, target } of pointsRef.current) {
              const posArr = points.geometry.attributes.position.array
              for (let i = 0; i < posArr.length; i++) {
                posArr[i] = THREE.MathUtils.lerp(start[i], target[i], t)
              }
              points.geometry.attributes.position.needsUpdate = true
            }
          }
        })

      },
      undefined,
      (err) => console.error('Brain GLB load error:', err)
    )

    // 5) Render loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // 6) Cleanup
    return () => {
      renderer.dispose()
      if (mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return <div ref={mountRef} className="brain-figure-container" />
}
