import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  componentDidCatch(error) { this.setState({ error: error.toString() }); }
  render() {
    if (this.state.error) return (
      <div style={{background:'#111',color:'#ff6b6b',padding:20,fontFamily:'monospace',fontSize:13,minHeight:'100vh'}}>
        <div style={{color:'#7ecf7a',fontSize:20,marginBottom:16}}>Tracky. Error</div>
        <pre style={{whiteSpace:'pre-wrap'}}>{this.state.error}</pre>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
