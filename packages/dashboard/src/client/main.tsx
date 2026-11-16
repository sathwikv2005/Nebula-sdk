import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
	return (
		<main>
			<h1>Nebula</h1>
			<p>Device Authentication Management</p>
		</main>
	)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
)
