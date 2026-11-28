import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'

import { getApplications } from '../../lib/api/applications'
import { getDevices } from '../../lib/api/device'
import { logout } from '../../lib/api/auth'

import type { Application } from '../../types/application'
import type { Device } from '../../types/device'
import type { DashboardContext } from '../../types/dashboard'

import Sidebar from '../../components/dashboard/sidebar/Sidebar'
import Header from '../../components/dashboard/header/Header'
import Loading from '../../components/loading/Loading'
import ErrorState from '../../components/dashboard/error-state/ErrorState'
import Overview from '../overview/Overview'

import styles from './Home.module.css'

export default function Home() {
	const navigate = useNavigate()
	const location = useLocation()

	const [applications, setApplications] = useState<Application[]>([])
	const [devices, setDevices] = useState<Device[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		let mounted = true

		async function loadDashboard() {
			setLoading(true)
			setError('')

			try {
				const [apps, registeredDevices] = await Promise.all([getApplications(), getDevices()])

				if (!mounted) return

				if (apps === null || registeredDevices === null) {
					setError('Unable to load dashboard data. Please try again.')
					return
				}

				setApplications(apps)
				setDevices(registeredDevices)
			} catch {
				if (mounted) {
					setError('Something went wrong while loading the dashboard.')
				}
			} finally {
				if (mounted) setLoading(false)
			}
		}

		loadDashboard()

		return () => {
			mounted = false
		}
	}, [])

	async function handleLogout() {
		try {
			const success = await logout()

			if (success) {
				navigate('/login', { replace: true })
			}
		} catch {
			// Keep the current session if logout fails.
		}
	}

	const dashboardContext: DashboardContext = {
		applications,
		setApplications,
		devices,
		loading,
		error,
	}

	return (
		<div className={styles.dashboard}>
			<Sidebar onLogout={handleLogout} />

			<main className={styles.main}>
				<Header />

				<div className={styles.pageContent}>
					{location.pathname === '/' ? (
						loading ? (
							<Loading message="Loading dashboard..." />
						) : error ? (
							<ErrorState message={error} onRetry={() => window.location.reload()} />
						) : (
							<Overview applications={applications} devices={devices} />
						)
					) : (
						<Outlet context={dashboardContext} />
					)}
				</div>

				<footer className={styles.footer}>
					<span>Nebula</span>
					<span>Device identity management</span>
				</footer>
			</main>
		</div>
	)
}
