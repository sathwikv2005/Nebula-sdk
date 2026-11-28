import { useOutletContext } from 'react-router'

import type { DashboardContext } from '../../types/dashboard'

import DeviceItem from '../../components/dashboard/device-item/DeviceItem'
import EmptyState from '../../components/dashboard/empty-state/EmptyState'
import Loading from '../../components/loading/Loading'
import ErrorState from '../../components/dashboard/error-state/ErrorState'

import styles from './Devices.module.css'

export default function Devices() {
	const { devices, loading, error } = useOutletContext<DashboardContext>()

	if (loading) return <Loading message="Loading devices..." />

	if (error) {
		return <ErrorState message={error} onRetry={() => window.location.reload()} />
	}

	return (
		<section className={styles.panel}>
			<div className={styles.panelHeader}>
				<div>
					<h2>Devices</h2>
					<p>All devices enrolled with your applications.</p>
				</div>

				<span className={styles.count}>{devices.length} total</span>
			</div>

			{devices.length === 0 ? (
				<EmptyState message="No devices have been enrolled yet." />
			) : (
				<div className={styles.list}>
					{devices.map((device) => (
						<DeviceItem key={device.id} device={device} />
					))}
				</div>
			)}
		</section>
	)
}
