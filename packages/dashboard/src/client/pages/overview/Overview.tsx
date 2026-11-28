import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router'

import { IoIosApps } from 'react-icons/io'
import { MdDeviceHub, MdOutlineDoNotDisturb } from 'react-icons/md'
import { HiStatusOnline } from 'react-icons/hi'

import type { Application } from '../../types/application'
import type { Device } from '../../types/device'

import StatCard from '../../components/dashboard/stat-card/StatCard'
import ApplicationItem from '../../components/dashboard/application-item/ApplicationItem'
import DeviceItem from '../../components/dashboard/device-item/DeviceItem'
import EmptyState from '../../components/dashboard/empty-state/EmptyState'

import styles from './Overview.module.css'
import type { DashboardContext } from '../../types/dashboard'

interface OverviewProps {
	applications: Application[]
	devices: Device[]
}

export default function Overview({ applications, devices }: OverviewProps) {
	const { setApplications, loading, error } = useOutletContext<DashboardContext>()

	const [showCreateModal, setShowCreateModal] = useState(false)
	const [editingApplication, setEditingApplication] = useState<Application | null>(null)

	const handleDeleted = (id: string) => {
		setApplications((current) => current.filter((app) => app.id !== id))
	}

	const stats = useMemo(() => {
		const active = devices.filter((device) => device.status === 'active').length
		const revoked = devices.filter((device) => device.status === 'revoked').length

		return [
			{
				label: 'Applications',
				value: applications.length,
				description: 'Registered applications',
				icon: <IoIosApps />,
			},
			{
				label: 'Total devices',
				value: devices.length,
				description: 'Registered devices',
				icon: <MdDeviceHub />,
			},
			{
				label: 'Active devices',
				value: active,
				description: 'Trusted and active',
				icon: <HiStatusOnline />,
				variant: 'success' as const,
			},
			{
				label: 'Revoked devices',
				value: revoked,
				description: 'Access revoked',
				icon: <MdOutlineDoNotDisturb />,
				variant: 'danger' as const,
			},
		]
	}, [applications, devices])

	const recentDevices = useMemo(() => {
		return [...devices]
			.sort((a, b) => {
				const aDate = new Date(a.lastAuthenticatedAt ?? a.createdAt).getTime()

				const bDate = new Date(b.lastAuthenticatedAt ?? b.createdAt).getTime()

				return bDate - aDate
			})
			.slice(0, 5)
	}, [devices])

	return (
		<div className={styles.overview}>
			<div className={styles.welcome}>
				<div>
					<h2>Welcome back.</h2>
					<p>Here's what's happening with your Nebula instance.</p>
				</div>
			</div>

			<div className={styles.statsGrid}>
				{stats.map((stat) => (
					<StatCard key={stat.label} {...stat} />
				))}
			</div>

			<div className={styles.contentGrid}>
				<section className={styles.panel}>
					<div className={styles.panelHeader}>
						<div>
							<h2>Applications</h2>
							<p>Your registered applications.</p>
						</div>

						<Link className={styles.textButton} to="/applications">
							View all →
						</Link>
					</div>

					{applications.length === 0 ? (
						<EmptyState message="No applications registered yet." />
					) : (
						<div className={styles.list}>
							{applications.slice(0, 5).map((app) => (
								<ApplicationItem
									key={app.id}
									application={app}
									onEdit={setEditingApplication}
									onDelete={handleDeleted}
								/>
							))}
						</div>
					)}
				</section>

				<section className={styles.panel}>
					<div className={styles.panelHeader}>
						<div>
							<h2>Recent devices</h2>
							<p>Latest device activity.</p>
						</div>

						<Link className={styles.textButton} to="/devices">
							View all →
						</Link>
					</div>

					{recentDevices.length === 0 ? (
						<EmptyState message="No devices registered yet." />
					) : (
						<div className={styles.list}>
							{recentDevices.map((device) => (
								<DeviceItem
									key={device.id}
									device={device}
									applicationName={
										applications.find((x) => x.id === device.applicationId)?.name || 'unknown'
									}
								/>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	)
}
