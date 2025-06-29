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
    const scene    = new THREE.Scene()
    const W        = mountRef.current.clientWidth
    const H        = mountRef.current.clientHeight
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    camera.position.set(0, 0, 4)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // 2) Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const key   = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(5,10,7)
    const fill  = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(-5,-5,5)
    const rim   = new THREE.DirectionalLight(0xffffff, 0.7); rim.position.set(-5,10,-5)
    scene.add(key, fill, rim)

    // 3) Load model + point cloud
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

const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64)
const spherePositions = sphereGeometry.getAttribute('position').array

let headPositions = []
let morphTargets = []



 // 3️⃣ point-cloud + prepare for morph
  model.traverse(child => {
    if (!child.isMesh) return

    // hide the original mesh
    child.material.transparent = true
    child.material.opacity     = 0

    // create Points exactly as before
    const points = new THREE.Points(
      child.geometry.clone(),
      new THREE.PointsMaterial({ color: 0x3C3744, size: 0.01, sizeAttenuation: true })
    )
    // bake in the mesh’s world transform so the dots sit correctly
    points.applyMatrix4(child.matrixWorld)
    model.add(points)

    // capture that transformed position buffer as our "head" shape
    const posAttr = points.geometry.getAttribute('position')
    const headArray = Float32Array.from(posAttr.array)

    // compute sphere positions matching count
    const sphereRadius = 2.5  // tweak to desired size
    const sphereArray = new Float32Array(headArray.length)
    for (let i = 0; i < headArray.length; i += 3) {
      // normalize the head-point to lie on a sphere
      const v = new THREE.Vector3(
        headArray[i + 0],
        headArray[i + 1],
        headArray[i + 2]
      ).normalize().multiplyScalar(sphereRadius)
      sphereArray[i + 0] = v.x
      sphereArray[i + 1] = v.y
      sphereArray[i + 2] = v.z
    }

    // stash both arrays for morphing later
    points.userData.headArray   = headArray
    points.userData.sphereArray = sphereArray

    // we'll animate the live position attribute in onUpdate()
  })



        scene.add(model)

        gsap.to({ t: 0 }, {
  t: 1,
  scrollTrigger: {
    trigger: '.hero',
    start: 'bottom bottom',
    endTrigger: '#about',
    end: 'top top',
    scrub: true,
  },
  onUpdate: function () {
    const t = this.targets()[0].t
    model.traverse(child => {
      if (child.isPoints) {
        const original = child.userData.original
        const morph = child.geometry.getAttribute('morphTarget').array
        const positionAttr = child.geometry.getAttribute('position')

        for (let i = 0; i < positionAttr.count; i++) {
          const j = i * 3
          positionAttr.array[j]     = THREE.MathUtils.lerp(original[j],     morph[j],     t)
          positionAttr.array[j + 1] = THREE.MathUtils.lerp(original[j + 1], morph[j + 1], t)
          positionAttr.array[j + 2] = THREE.MathUtils.lerp(original[j + 2], morph[j + 2], t)
        }
        positionAttr.needsUpdate = true
      }
    })
  }
})


        // 4) ScrollTrigger — move model.y from 0 → 3 as .hero → #about
        gsap.to(model.position, {
          y: -0.8,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'bottom bottom',
            endTrigger: '#about',
            end: 'bottom top',
            scrub: true,
          }
        })
      },
      undefined,
      err => console.error('GLTF load error:', err)
    )

    // 5) Mouse-follow
    let mx = 0, my = 0
    const onMouse = e => {
      mx = (e.clientX / window.innerWidth)  * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouse)

    // 6) Render loop
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
     // only remove the canvas if it's still mounted
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
