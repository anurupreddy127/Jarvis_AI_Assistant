// src/components/HumanFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import anime from 'animejs'
import bustUrl from '../assets/human.glb?url'

export default function HumanFigure() {
  const mountRef = useRef(null)
  const modelRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const animationIdRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    gsap.registerPlugin(ScrollTrigger)

    // Three.js setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)
    
    // Store references
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera
    
    // Position camera
    camera.position.z = 5

    // Load GLTF model
    const loader = new GLTFLoader()
    loader.load(
      bustUrl,
      (gltf) => {
        const model = gltf.scene
        
        // Find the mesh in the loaded model
        let mesh = null
        model.traverse((child) => {
          if (child.isMesh) {
            mesh = child
          }
        })

        if (mesh && mesh.geometry) {
          // Get vertex positions from the mesh
          const positions = mesh.geometry.attributes.position
          const vertexCount = positions.count
          
          // Create arrays for head positions and sphere positions
          const headArray = new Float32Array(vertexCount * 3)
          const sphereArray = new Float32Array(vertexCount * 3)
          
          // Copy original positions (head shape)
          for (let i = 0; i < vertexCount * 3; i++) {
            headArray[i] = positions.array[i]
          }
          
          // Generate sphere positions
          const radius = 2
          for (let i = 0; i < vertexCount; i++) {
            const phi = Math.acos(-1 + (2 * i) / vertexCount)
            const theta = Math.sqrt(vertexCount * Math.PI) * phi
            
            sphereArray[i * 3] = radius * Math.cos(theta) * Math.sin(phi)
            sphereArray[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
            sphereArray[i * 3 + 2] = radius * Math.cos(phi)
          }
          
          // Create point cloud geometry
          const pointGeometry = new THREE.BufferGeometry()
          pointGeometry.setAttribute('position', new THREE.BufferAttribute(headArray.slice(), 3))
          
          // Store arrays in userData for morphing
          pointGeometry.userData.headArray = headArray
          pointGeometry.userData.sphereArray = sphereArray
          
          // Create point material
          const pointMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.02,
            sizeAttenuation: true
          })
          
          // Create points object
          const points = new THREE.Points(pointGeometry, pointMaterial)
          points.userData.headArray = headArray
          points.userData.sphereArray = sphereArray
          
          // Store reference and add to scene
          modelRef.current = points
          scene.add(points)
        }
      },
      (progress) => {
        console.log('Loading progress:', progress)
      },
      (error) => {
        console.error('Error loading model:', error)
        // Create a fallback simple point cloud if model fails to load
        createFallbackPointCloud()
      }
    )

    // Fallback point cloud creation
    const createFallbackPointCloud = () => {
      const vertexCount = 1000
      const headArray = new Float32Array(vertexCount * 3)
      const sphereArray = new Float32Array(vertexCount * 3)
      
      // Generate random head-like positions
      for (let i = 0; i < vertexCount; i++) {
        headArray[i * 3] = (Math.random() - 0.5) * 2
        headArray[i * 3 + 1] = (Math.random() - 0.5) * 2
        headArray[i * 3 + 2] = (Math.random() - 0.5) * 2
      }
      
      // Generate sphere positions
      const radius = 2
      for (let i = 0; i < vertexCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / vertexCount)
        const theta = Math.sqrt(vertexCount * Math.PI) * phi
        
        sphereArray[i * 3] = radius * Math.cos(theta) * Math.sin(phi)
        sphereArray[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi)
        sphereArray[i * 3 + 2] = radius * Math.cos(phi)
      }
      
      const pointGeometry = new THREE.BufferGeometry()
      pointGeometry.setAttribute('position', new THREE.BufferAttribute(headArray.slice(), 3))
      
      const pointMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.02,
        sizeAttenuation: true
      })
      
      const points = new THREE.Points(pointGeometry, pointMaterial)
      points.userData.headArray = headArray
      points.userData.sphereArray = sphereArray
      
      modelRef.current = points
      scene.add(points)
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)

    // Anime.js bubble system
    const { random, cos, sin, sqrt, PI } = Math
    const count    = 2500
    const duration = 3000
    const win      = { w: window.innerWidth * .26, h: window.innerHeight * .26 }
    const target   = { x: 0, y: 0, r: win.w * .25 }
    const theta    = Symbol()
    const radius   = Symbol()

    // create <div> bubbles behind the scenes:
    const bubbles = []
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div')
      const h  = anime.random(15, 25)
      const l  = anime.random(10, 18)
      anime.set(el, { background: `hsl(${h},60%,${l}%)` })
      el[theta]  = random() * PI * 2
      el[radius] = target.r * sqrt(random())
      document.body.appendChild(el)
      bubbles.push(el)
    }

    const bubbleTl = anime.timeline({
      autoplay: false,
      defaults: {
        loop: true,
        easing: 'easeInOutSine',
        onLoop(self) { self.refresh() },
      }
    })
    bubbleTl
      .add({
        targets: bubbles,
        x: el =>  target.x + el[radius]*cos(el[theta]),
        y: el =>  target.y + el[radius]*sin(el[theta]),
        duration: () => duration + anime.random(-100,100),
        easing: 'easeInOutCubic',
        update: anim => {
          // mutate theta+radius on loop
          if (anim.currentTime === 0) {
            for (const el of bubbles) {
              el[theta]  = random()*PI*2
              el[radius] = target.r * sqrt(random())
            }
          }
        }
      }, anime.stagger(duration/count * 1.125))
      .add({
        targets: target,
        r: () => win.w * anime.random(.05,.5,2),
        duration: 1250,
      }, 0)
      .add({
        targets: target,
        x: () => anime.random(-win.w,win.w),
        modifier: x => x + Math.sin(bubbleTl.currentTime*.0007) * win.w*.65,
        duration: 2800,
      }, 0)
      .add({
        targets: target,
        y: () => anime.random(-win.h,win.h),
        modifier: y => y + Math.cos(bubbleTl.currentTime*.00012)*win.h*.65,
        duration: 1800,
      }, 0)

    // ScrollTrigger for morph-and-move
    ScrollTrigger.create({
      trigger: '.hero',
      start:    'bottom bottom',
      endTrigger:'#about',
      end:      'top top',
      scrub:    true,
      onUpdate: self => {
        const t = self.progress

        // Check if model is loaded before trying to traverse
        if (modelRef.current && modelRef.current.isPoints) {
          const pos = modelRef.current.geometry.getAttribute('position')
          const head = modelRef.current.userData.headArray
          const sph  = modelRef.current.userData.sphereArray
          
          if (pos && head && sph) {
            for (let i = 0; i < pos.count; i++) {
              const j = i*3
              pos.array[j  ] = THREE.MathUtils.lerp(head[j],   sph[j],   t)
              pos.array[j+1] = THREE.MathUtils.lerp(head[j+1], sph[j+1], t)
              pos.array[j+2] = THREE.MathUtils.lerp(head[j+2], sph[j+2], t)
            }
            pos.needsUpdate = true
          }
        }

        // once we've fully morphed (t===1), kick off the bubbleTl:
        if (t >= 1 && !bubbleTl.playing) {
          bubbleTl.play()
        }
      }
    })

    // Cleanup function
    return () => {
      // Cancel animation frame
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      // Remove event listeners
      window.removeEventListener('resize', handleResize)
      
      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
      
      // Clean up anime.js bubbles
      bubbles.forEach(bubble => {
        if (bubble.parentNode) {
          bubble.parentNode.removeChild(bubble)
        }
      })
      
      // Clean up Three.js resources
      if (rendererRef.current) {
        if (mountRef.current && rendererRef.current.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement)
        }
        rendererRef.current.dispose()
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose()
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        })
      }
    }
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}