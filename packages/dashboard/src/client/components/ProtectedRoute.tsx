import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return <div className="auth-loading">Loading...</div>
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}
