// src/components/BrainFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import brainUrl from '../assets/brain.glb?url'

export default function BrainFigure() {
  const mountRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return

    // scene + camera + renderer
    const scene    = new THREE.Scene()
    const { clientWidth: W, clientHeight: H } = mountRef.current
    const camera   = new THREE.PerspectiveCamera(45, W/H, 0.1, 1000)
    camera.position.set(0, 0, 6)   // pulled back a bit
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // lighting
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.6))
    const dir = new THREE.DirectionalLight(0xffffff, 1)
    dir.position.set(5, 10, 7)
    scene.add(dir)

    // load brain GLB
    new GLTFLoader().load(
      brainUrl,
      (gltf) => {
        const mesh = gltf.scene.children.find(c => c.isMesh)
        if (!mesh) {
          console.error('No mesh found in brain.glb!')
          return
        }

        // center + scale the raw mesh (we use only its geometry for sampling)
        const box    = new THREE.Box3().setFromObject(mesh)
        const center = box.getCenter(new THREE.Vector3())
        mesh.position.sub(center)
        mesh.scale.setScalar(0.8)

        // prepare sampler over the **surface** of your mesh
        const sampler = new MeshSurfaceSampler(mesh)
          .setWeightAttribute(null)
          .build()

        const POINT_COUNT = 5000  // ← bump this up/down for density
        const positions  = new Float32Array(POINT_COUNT * 3)
        const tempPos    = new THREE.Vector3()
        const tempNorm   = new THREE.Vector3()

        for (let i = 0; i < POINT_COUNT; i++) {
          sampler.sample(tempPos, tempNorm)
          positions[3*i]     = tempPos.x
          positions[3*i + 1] = tempPos.y
          positions[3*i + 2] = tempPos.z
        }

        // build the Points cloud
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

        const material = new THREE.PointsMaterial({
          color: 0x3D52D5,
          size: 0.015,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.9
        })

        const points = new THREE.Points(geometry, material)
        scene.add(points)
      },
      undefined,
      err => console.error('Brain load error:', err)
    )

    // render loop
    const loop = () => {
      requestAnimationFrame(loop)
      renderer.render(scene, camera)
    }
    loop()

    // cleanup
    return () => {
      renderer.dispose()
      if (mountRef.current.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
