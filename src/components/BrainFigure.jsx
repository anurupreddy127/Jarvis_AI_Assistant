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

    const scene = new THREE.Scene()
    const { clientWidth: W, clientHeight: H } = mountRef.current
    const camera = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    camera.position.set(0, 0, 4)
    camera.lookAt(0,0,0)

    const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true })
    renderer.setSize(W,H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // lights
    scene.add(new THREE.HemisphereLight(0xffffff,0x444444,0.6))
    const key = new THREE.DirectionalLight(0xffffff,1)
    key.position.set(5,10,7)
    const fill = new THREE.DirectionalLight(0xffffff,0.5)
    fill.position.set(-5,-5,5)
    const rim = new THREE.DirectionalLight(0xffffff,0.7)
    rim.position.set(-5,10,-5)
    scene.add(key,fill,rim)

    // load brain glb
    new GLTFLoader().load(brainUrl, gltf => {
      const model = gltf.scene

      // center & scale the whole group
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      model.position.sub(center)
      model.scale.setScalar(0.1)

      // for each mesh, replace with Points
      model.traverse(child => {
        if (!child.isMesh) return

        // bake world transform onto a cloned geometry
        const geo = child.geometry.clone().applyMatrix4(child.matrixWorld)
        const positions = geo.getAttribute('position').array
        const pointsMat = new THREE.PointsMaterial({
          color: 0x8a2be2,        // pick a “brain” color
          size: 0.015,
          sizeAttenuation: true
        })
        const points = new THREE.Points(geo, pointsMat)
        scene.add(points)
        pointsRef.current.push(points)
      })

      // slide in the brain as we scroll from #about → #features
      gsap.fromTo(pointsRef.current,
        { y: 3, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '#features',
            start: 'top bottom',     // when top of features hits bottom of viewport
            end:   'center center',
            scrub: true
          },
          onUpdate() {
            // GSAP tweens position and material.opacity for you
            pointsRef.current.forEach(p => {
              p.material.opacity = this.targets()[0].opacity
            })
          }
        }
      )

      scene.add(model)
    })

    // render loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

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
