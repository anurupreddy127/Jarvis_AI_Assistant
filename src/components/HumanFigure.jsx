// src/components/HumanFigure.jsx
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
 import { createTimeline, stagger, utils } from 'animejs'
import bustUrl from '../assets/human.glb?url'

export default function HumanFigure() {
  const mountRef = useRef(null)
  const modelRef = useRef(null)

  useEffect(() => {
    if (!mountRef.current) return
    gsap.registerPlugin(ScrollTrigger)

    // … your Three.js setup, loading, point-cloud & head→sphere morph here …
    // assume “pointsGroup” is a THREE.Group() containing all THREE.Points

    // 1) build your anime.js timeline exactly as you had it:
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
      const h  = utils.random(15, 25)
      const l  = utils.random(10, 18)
      utils.set(el, { background: `hsl(${h},60%,${l}%)` })
      el[theta]  = random() * PI * 2
      el[radius] = target.r * sqrt(random())
      document.body.appendChild(el)
      bubbles.push(el)
    }

    const bubbleTl = createTimeline({
      autoplay: false,
      defaults: {
        loop: true,
        ease: 'inOut(1.3)',
        onLoop(self) { self.refresh() },
      }
    })
    bubbleTl
      .add({
        targets: bubbles,
        x: el =>  target.x + el[radius]*cos(el[theta]),
        y: el =>  target.y + el[radius]*sin(el[theta]),
        duration: () => duration + utils.random(-100,100),
        easing: 'inOut(1.5)',
        update: anim => {
          // mutate theta+radius on loop
          if (anim.currentTime === 0) {
            for (const el of bubbles) {
              el[theta]  = random()*PI*2
              el[radius] = target.r * sqrt(random())
            }
          }
        }
      }, stagger(duration/count * 1.125))
      .add({
        targets: target,
        r: () => win.w * utils.random(.05,.5,2),
        duration: 1250,
      }, 0)
      .add({
        targets: target,
        x: () => utils.random(-win.w,win.w),
        modifier: x => x + Math.sin(bubbleTl.currentTime*.0007) * win.w*.65,
        duration: 2800,
      }, 0)
      .add({
        targets: target,
        y: () => utils.random(-win.h,win.h),
        modifier: y => y + Math.cos(bubbleTl.currentTime*.00012)*win.h*.65,
        duration: 1800,
      }, 0)

    // 2) morph-and-move ScrollTrigger:
    ScrollTrigger.create({
      trigger: '.hero',
      start:    'bottom bottom',
      endTrigger:'#about',
      end:      'top top',
      scrub:    true,
      onUpdate: self => {
        const t = self.progress

        // drive your THREE.js head→sphere morph (already in place)
        modelRef.current.traverse(child => {
          if (child.isPoints) {
            const pos = child.geometry.getAttribute('position')
            const head = child.userData.headArray
            const sph  = child.userData.sphereArray
            for (let i = 0; i < pos.count; i++) {
              const j = i*3
              pos.array[j  ] = THREE.MathUtils.lerp(head[j],   sph[j],   t)
              pos.array[j+1] = THREE.MathUtils.lerp(head[j+1], sph[j+1], t)
              pos.array[j+2] = THREE.MathUtils.lerp(head[j+2], sph[j+2], t)
            }
            pos.needsUpdate = true
          }
        })

        // once we've fully morphed (t===1), kick off the bubbleTl:
        if (t >= 1 && !bubbleTl.playing) {
          bubbleTl.play()
        }
      }
    })

    // … your existing mouse-follow + render loop + cleanup …
  }, [])

  return <div ref={mountRef} className="human-figure-container" />
}
