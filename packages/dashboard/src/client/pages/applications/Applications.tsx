import { useState } from 'react'
import { useOutletContext } from 'react-router'

import type { DashboardContext } from '../../types/dashboard'
import type { Application } from '../../types/application'

import ApplicationItem from '../../components/dashboard/application-item/ApplicationItem'
import CreateApplication from '../../components/dashboard/create-application/CreateApplication'
import EditApplication from '../../components/dashboard/edit-application/EditApplication'

import EmptyState from '../../components/dashboard/empty-state/EmptyState'
import Loading from '../../components/loading/Loading'
import ErrorState from '../../components/dashboard/error-state/ErrorState'

import styles from './Applications.module.css'

export default function Applications() {
	const { applications, setApplications, loading, error } = useOutletContext<DashboardContext>()

	const [showCreateModal, setShowCreateModal] = useState(false)
	const [editingApplication, setEditingApplication] = useState<Application | null>(null)

	const handleCreated = (application: Application) => {
		setApplications((current) => [...current, application])
	}

	const handleUpdated = (updated: Application) => {
		setApplications((current) => current.map((app) => (app.id === updated.id ? updated : app)))
	}

	const handleDeleted = (id: string) => {
		setApplications((current) => current.filter((app) => app.id !== id))
	}

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

				<div className={styles.headerActions}>
					<span className={styles.count}>{applications.length} total</span>

					<button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
						<span>+</span> Create application
					</button>
				</div>
			</div>

			{applications.length === 0 ? (
				<EmptyState message="No applications registered yet." />
			) : (
				<div className={styles.list}>
					{applications.map((app) => (
						<ApplicationItem
							key={app.id}
							application={app}
							onEdit={setEditingApplication}
							onDelete={handleDeleted}
						/>
					))}
				</div>
			)}

			{showCreateModal && (
				<CreateApplication onClose={() => setShowCreateModal(false)} onCreated={handleCreated} />
			)}

			{editingApplication && (
				<EditApplication
					application={editingApplication}
					onClose={() => setEditingApplication(null)}
					onUpdated={handleUpdated}
				/>
			)}
		</section>
	)
}
