import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import Loading from './loading/Loading'

export default function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth()

	if (isLoading) {
		return <Loading />
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}
