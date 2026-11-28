import { useOutletContext } from 'react-router'

import type { DashboardContext } from '../../types/dashboard'

import ApplicationItem from '../../components/dashboard/application-item/ApplicationItem'
import EmptyState from '../../components/dashboard/empty-state/EmptyState'
import Loading from '../../components/loading/Loading'
import ErrorState from '../../components/dashboard/error-state/ErrorState'

import styles from './Applications.module.css'

export default function Applications() {
	const { applications, loading, error } = useOutletContext<DashboardContext>()

	if (loading) return <Loading message="Loading applications..." />

	if (error) {
		return <ErrorState message={error} onRetry={() => window.location.reload()} />
	}

	return (
		<section className={styles.panel}>
			<div className={styles.panelHeader}>
				<div>
					<h2>Applications</h2>
					<p>Applications registered with Nebula.</p>
				</div>

				<span className={styles.count}>{applications.length} total</span>
			</div>

			{applications.length === 0 ? (
				<EmptyState message="No applications registered yet." />
			) : (
				<div className={styles.list}>
					{applications.map((app) => (
						<ApplicationItem key={app.id} application={app} />
					))}
				</div>
			)}
		</section>
	)
}
