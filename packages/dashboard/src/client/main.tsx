import { BrowserRouter } from 'react-router'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
	<BrowserRouter basename={window.__NEBULA_CONFIG__.basePath}>
		<App />
	</BrowserRouter>,
)
