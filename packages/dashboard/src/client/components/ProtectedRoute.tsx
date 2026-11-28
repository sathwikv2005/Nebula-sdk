import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'
import Loading from './loading/Loading'

export default function ProtectedRoute() {
	const { isAuthenticated, isLoading } = useAuth()
	const config = window.__NEBULA_CONFIG__

	if (isLoading) {
		return <Loading />
	}

	if (!isAuthenticated) {
		if (config.customLogin) {
			window.location.replace(config.loginPath)
			return <Loading />
		}

		return <Navigate to={config.loginPath} replace />
	}

	return <Outlet />
}
