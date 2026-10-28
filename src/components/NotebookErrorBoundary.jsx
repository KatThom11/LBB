import { Component } from 'react';

export default class NotebookErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="recovery-page"><p className="eyebrow">LBB / THE LIVING NOTEBOOK</p><h1>The page couldn’t finish opening.</h1><p>Your saved notes have not been deleted. Reload to try again, or download them before starting a fresh page.</p><div className="dialog-actions"><button className="button button-outline" onClick={() => {
      let text; try { text = localStorage.getItem('lbb-notebook-v2') || localStorage.getItem('lbb-notebook-v1') || '{}'; } catch { text = '{}'; }
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'lbb-recovered-notes.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }}>Download saved notes</button><button className="button button-dark" onClick={() => location.reload()}>Reload notebook</button></div></main>;
  }
}
