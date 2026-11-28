import { useState } from 'react'
import { useOutletContext } from 'react-router'
import { RiArrowDownSLine } from 'react-icons/ri'
import { FiLayers } from 'react-icons/fi'

import type { DashboardContext } from '../../types/dashboard'

import DeviceItem from '../../components/dashboard/device-item/DeviceItem'
import EmptyState from '../../components/dashboard/empty-state/EmptyState'
import Loading from '../../components/loading/Loading'
import ErrorState from '../../components/dashboard/error-state/ErrorState'

import styles from './Devices.module.css'

export default function Devices() {
	const { devices, applications, setDevices, loading, error } = useOutletContext<DashboardContext>()

	const [expandedApplications, setExpandedApplications] = useState<string[]>([])

	const toggleApplication = (applicationId: string) => {
		setExpandedApplications((prev) =>
			prev.includes(applicationId)
				? prev.filter((id) => id !== applicationId)
				: [...prev, applicationId],
		)
	}

	if (loading) return <Loading message="Loading devices..." />

	if (error) {
		return <ErrorState message={error} onRetry={() => window.location.reload()} />
	}

	return (
		<section className={styles.panel}>
			<div className={styles.panelHeader}>
				<div>
					<h2>Devices</h2>
					<p>Manage devices enrolled with your applications.</p>
				</div>

				<div className={styles.headerStats}>
					<span className={styles.count}>
						{devices.length} {devices.length === 1 ? 'device' : 'devices'}
					</span>
					<span className={styles.applicationCount}>
						{applications.length} {applications.length === 1 ? 'application' : 'applications'}
					</span>
				</div>
			</div>

			{applications.length === 0 ? (
				<EmptyState message="No applications have been created yet." />
			) : (
				<div className={styles.applicationList}>
					{applications.map((application) => {
						const applicationDevices = devices.filter(
							(device) => device.applicationId === application.id,
						)

						const expanded = expandedApplications.includes(application.id)

						return (
							<div key={application.id} className={styles.application}>
								<button
									type="button"
									className={`${styles.applicationHeader} ${
										expanded ? styles.applicationHeaderExpanded : ''
									}`}
									onClick={() => toggleApplication(application.id)}
									aria-expanded={expanded}
								>
									<div className={styles.applicationIcon}>
										<FiLayers />
									</div>

									<div className={styles.applicationDetails}>
										<strong>{application.name}</strong>
										<span>
											{applicationDevices.length === 0
												? 'No devices enrolled'
												: `${applicationDevices.length} ${
														applicationDevices.length === 1 ? 'device' : 'devices'
													} enrolled`}
										</span>
									</div>

									<span
										className={`${styles.deviceCount} ${
											applicationDevices.length === 0 ? styles.deviceCountEmpty : ''
										}`}
									>
										{applicationDevices.length}
									</span>

									<span className={`${styles.chevron} ${expanded ? styles.chevronExpanded : ''}`}>
										<RiArrowDownSLine />
									</span>
								</button>

								{expanded && (
									<div className={styles.deviceList}>
										{applicationDevices.length === 0 ? (
											<div className={styles.emptyDevices}>
												<div className={styles.emptyIcon}>
													<FiLayers />
												</div>
												<strong>No devices yet</strong>
												<span>Devices enrolled with this application will appear here.</span>
											</div>
										) : (
											applicationDevices.map((device) => (
												<DeviceItem
													key={device.id}
													device={device}
													applicationName={application.name}
													setDevices={setDevices}
												/>
											))
										)}
									</div>
								)}
							</div>
						)
					})}
				</div>
			)}
		</section>
	)
}
