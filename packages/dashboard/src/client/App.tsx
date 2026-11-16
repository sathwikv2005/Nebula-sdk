import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import { useEffect } from 'react'

export default function App() {
	useEffect(() => {
		const title = window.__NEBULA_CONFIG__?.title
		document.title = title || 'Nebula Dashboard'
	}, [])

	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}
