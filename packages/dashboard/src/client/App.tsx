import { Routes, Route, Navigate } from 'react-router'

import Home from './pages/home/Home'
import Login from './pages/login/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'

import { useEffect } from 'react'
import Applications from './pages/applications/Applications'
import Devices from './pages/devices/Devices'
import Enrollment from './pages/enrollment/Enrollment'
import Settings from './pages/settings/Settings'

function AppRoutes() {
	useEffect(() => {
		const title = window.__NEBULA_CONFIG__?.title
		document.title = title || 'Nebula Dashboard'
	}, [])

	return (
		<Routes>
			<Route path="/login" element={<Login />} />

			<Route element={<ProtectedRoute />}>
				<Route path="/" element={<Home />}>
					<Route path="applications" element={<Applications />} />
					<Route path="devices" element={<Devices />} />
					<Route path="enrollment" element={<Enrollment />} />
					<Route path="settings" element={<Settings />} />
				</Route>
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
