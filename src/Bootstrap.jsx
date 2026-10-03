import { useEffect, useState } from 'react'
import App from './App.jsx'
import { getUsers } from './db.js'

const vars = {
  '--bg': '#0b100d',
  '--surface': '#141b16',
  '--raised': '#1a231c',
  '--text': '#f5f4ef',
  '--muted': '#8e9a90',
  '--accent': '#93d59b',
  '--border': '#263129',
  '--soft': '#1f2c22',
}

export default function Bootstrap() {
  const [state, setState] = useState('loading')

  useEffect(() => {
    let active = true
    getUsers()
      .then(users => {
        if (!active) return
        setState(users?.length ? 'app' : 'choice')
      })
      .catch(() => {
        if (active) setState('choice')
      })
    return () => { active = false }
  }, [])

  if (state === 'app') return <App />

  if (state === 'loading') {
    return (
      <div className="auth-shell" style={vars}>
        <div className="auth-card">
          <div className="brand large">Tracky<span>.</span></div>
          <p>Opening your journal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell" style={vars}>
      <div className="auth-card">
        <div className="brand large">Tracky<span>.</span></div>
        <h1>Welcome to Tracky V2.</h1>
        <p>If you already used Tracky, bring your existing user and journal over. Your original app stays untouched.</p>

        <a
          href="/migrate.html"
          className="button button-primary full"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginBottom: 10 }}
        >
          Import existing Tracky
        </a>

        <button className="button button-secondary full" onClick={() => setState('app')}>
          Create a new journal
        </button>

        <p style={{ marginTop: 18, fontSize: 12 }}>
          Already imported on this preview? Reload the page and your user will appear.
        </p>
      </div>
    </div>
  )
}
