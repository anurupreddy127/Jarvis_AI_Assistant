import React from 'react'

export default function Demo() {
  return (
    <section
      style={{
        minHeight: '100vh',
        background: 'black',
        color: 'white',
        padding: '4rem 2rem',
        fontFamily: "'Audiowide', cursive",
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Watch Jarvis in Action
      </h1>

      <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: '1.6', fontSize: '1rem' }}>
        Jarvis is a voice-controlled Chrome extension that listens to your commands, automates your browser,
        and speaks back using ultra-realistic ElevenLabs voices. Built with React, ChatGPT, and Three.js —
        it's the future of browsing.
      </p>

      <div style={{ maxWidth: '960px', margin: '0 auto', aspectRatio: '16 / 9' }}>
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/vBdBXz1gbug?si=wbHol325MlB0lB6N"
          title="Jarvis Chrome Extension Demo"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{zIndex:201, position 'relative'}}
        ></iframe>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '1rem', opacity: 0.8 }}>
        Try the extension or explore the code on GitHub soon.
      </p>
    </section>
  )
}
