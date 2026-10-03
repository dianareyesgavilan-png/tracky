import React from 'react'
import ReactDOM from 'react-dom/client'
import Bootstrap from './Bootstrap.jsx'
import { inject } from '@vercel/analytics'

inject()

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  componentDidCatch(error) {
    this.setState({ error: error.toString() })
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#0b100d', color: '#f2a0aa', padding: 24, fontFamily: 'monospace', fontSize: 13, minHeight: '100vh' }}>
          <div style={{ color: '#93d59b', fontSize: 20, marginBottom: 16 }}>Tracky. Error</div>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Bootstrap />
  </ErrorBoundary>
)
