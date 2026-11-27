import { Routes, Route, Navigate } from 'react-router'

import Home from './pages/Home'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

import { useEffect } from 'react'

function AppRoutes() {
	useEffect(() => {
		const title = window.__NEBULA_CONFIG__?.title
		document.title = title || 'Nebula Dashboard'
	}, [])

	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route element={<ProtectedRoute />}>
				<Route path="/" element={<Home />} />
			</Route>

			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	)
}

export default function App() {
	return (
		<AuthProvider>
			<AppRoutes />
		</AuthProvider>
	)
}
