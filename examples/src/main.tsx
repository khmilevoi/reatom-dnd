import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
	return (
		<div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
			<h1>reatom-dnd Examples</h1>
			<p>Demo coming soon...</p>
		</div>
	)
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
