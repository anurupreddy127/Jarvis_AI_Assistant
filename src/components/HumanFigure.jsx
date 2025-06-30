// src/components/HumanFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import bustUrl from '../assets/human.glb?url'

export default function HumanFigure() {
  const mountRef = useRef(null)
  const modelRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    gsap.registerPlugin(ScrollTrigger)

    // 1) Three.js setup
    const scene  = new THREE.Scene()
    const W      = mountRef.current.clientWidth
    const H      = mountRef.current.clientHeight
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000)
    camera.position.set(0, 0, 4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // 2) Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const key  = new THREE.DirectionalLight(0xffffff, 1.0)
    key.position.set(5, 10, 7)
    const fill = new THREE.DirectionalLight(0xffffff, 0.5)
    fill.position.set(-5, -5, 5)
    const rim  = new THREE.DirectionalLight(0xffffff, 0.7)
    rim.position.set(-5, 10, -5)
    scene.add(key, fill, rim)

    // 3) Load model + point-cloud + morph setup
    new GLTFLoader().load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene
        modelRef.current = model

        // center & scale
        const box    = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        model.position.sub(center)
        model.scale.setScalar(0.8)

        // prepare sphere template
        const sphereRadius     = 2
        const sphereGeometry   = new THREE.SphereGeometry(sphereRadius, 64, 64)
        const spherePositions  = sphereGeometry.getAttribute('position').array

        // traverse meshes, create Points and store morph arrays
        model.traverse(child => {
          if (!child.isMesh) return

          // hide mesh
          child.material.transparent = true
          child.material.opacity     = 0

          // create points
          const points = new THREE.Points(
            child.geometry.clone(),
            new THREE.PointsMaterial({ color: 0x3C3744, size: 0.01, sizeAttenuation: true })
          )
          // apply world transform
          points.applyMatrix4(child.matrixWorld)
          model.add(points)

          // capture head positions
          const posAttr  = points.geometry.getAttribute('position')
          const headArr  = Float32Array.from(posAttr.array)

// …inside your GLTFLoader callback, after you build `headArr`…

// 1) how many points do we have?
const pointCount = headArr.length / 3

// 2) prepare an array to hold the uniform sphere positions
const sphereArr = new Float32Array(headArr.length)
const R = 1.5  // your desired sphere radius

// 3) golden angle constant
const goldenAngle = Math.PI * (3 - Math.sqrt(5))

for (let i = 0; i < pointCount; i++) {
  const j = i * 3

  // fraction along [0,1]
  const t = i / (pointCount - 1)

  // latitude φ and longitude θ in radians
  const phi   = Math.acos(1 - 2 * t)
  const theta = goldenAngle * i

  // spherical → Cartesian
  const x = Math.sin(phi) * Math.cos(theta)
  const y = Math.sin(phi) * Math.sin(theta)
  const z = Math.cos(phi)

  sphereArr[j + 0] = x * R
  sphereArr[j + 1] = y * R
  sphereArr[j + 2] = z * R
}

// stash them exactly like before:
points.userData.headArray   = headArr
points.userData.sphereArray = sphereArr

        })

        scene.add(model)

        // 4) ScrollTrigger morph
        gsap.to({ t: 0 }, {
          t: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start:   'bottom bottom',
            end:     'bottom top',
            scrub:   true,
          },
          onUpdate() {
            const t = this.targets()[0].t
            model.traverse(child => {
              if (!child.isPoints) return
              const pa   = child.geometry.attributes.position.array
              const head = child.userData.headArray
              const sph  = child.userData.sphereArray
              for (let i = 0; i < pa.length; i++) {
                pa[i] = THREE.MathUtils.lerp(head[i], sph[i], t)
              }
              child.geometry.attributes.position.needsUpdate = true
            })
          }
        })

        // 5) ScrollTrigger slide Y
        gsap.to(model.position, {
          y: -0.1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
          }
        })
      },
      undefined,
      err => console.error('GLTF load error:', err)
    )

    // 6) Mouse-follow
    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX / window.innerWidth)  * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouse)

    // 7) Render loop
    const animate = () => {
      requestAnimationFrame(animate)
      const m = modelRef.current
      if (m) {
        m.rotation.y = mx * 0.3
        m.rotation.x = my * 0.15
      }
      renderer.render(scene, camera)
    }
    animate()

    // cleanup
    return () => {
      window.removeEventListener('mousemove', onMouse)
      renderer.dispose()
      if (
        mountRef.current &&
        renderer.domElement.parentNode === mountRef.current
      ) {
        mountRef.current.removeChild(renderer.domElement)
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
