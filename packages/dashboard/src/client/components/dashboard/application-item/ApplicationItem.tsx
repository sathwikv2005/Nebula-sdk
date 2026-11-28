import { useState } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'

import type { Application } from '../../../types/application'
import { deleteApplication } from '../../../lib/api/applications'
import { formatDate } from '../../../utils/dashboard'

import styles from './ApplicationItem.module.css'

interface ApplicationItemProps {
	application: Application
	onEdit: (application: Application) => void
	onDelete: (id: string) => void
}

export default function ApplicationItem({ application, onEdit, onDelete }: ApplicationItemProps) {
	const [expanded, setExpanded] = useState(false)
	const [deleting, setDeleting] = useState(false)

	const handleDelete = async () => {
		const confirmed = window.confirm(
			`Are you sure you want to delete "${application.name}"?\n\nThis action cannot be undone.`,
		)

		if (!confirmed) return

		setDeleting(true)

		try {
			const res = await deleteApplication(application.id)
			if (!res) {
				window.alert('Failed to delete application.')
				return
			}
			if (res.error) {
				window.alert(`Failed to delete application.\n${res.error.message}`)
				return
			}
			onDelete(application.id)
		} catch (error) {
			window.alert(error)
		} finally {
			setDeleting(false)
		}
	}

	return (
		<div className={styles.application}>
			<div
				className={styles.applicationTrigger}
				onClick={() => setExpanded((current) => !current)}
				role="button"
				tabIndex={0}
				aria-expanded={expanded}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						setExpanded((current) => !current)
					}
				}}
			>
				<div className={styles.listItem}>
					<div className={styles.itemIcon}>▦</div>

					<div className={styles.itemDetails}>
						<strong>{application.name}</strong>
						<span>ID: {application.id}</span>
					</div>

					<span className={styles.itemDate}>{formatDate(application.createdAt)}</span>
				</div>

				<span className={`${styles.chevron} ${expanded ? styles.chevronOpen : ''}`}>
					<RiArrowDownSLine />
				</span>
			</div>

			{expanded && (
				<div className={styles.details}>
					<Detail label="Name" value={application.name} />
					<Detail label="Device Count" value={application.deviceCount.toString()} mono />
					<Detail label="Created At" value={formatDate(application.createdAt)} />
					<Detail label="Last Updated" value={formatDate(application.updatedAt)} />

					<div className={styles.detailActions}>
						<button className={styles.editButton} onClick={() => onEdit(application)}>
							Edit application
						</button>

						<button className={styles.deleteButton} onClick={handleDelete} disabled={deleting}>
							{deleting ? 'Deleting...' : 'Delete application'}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className={styles.detail}>
			<span className={styles.detailLabel}>{label}</span>
			<span className={`${styles.detailValue} ${mono ? styles.mono : ''}`}>{value}</span>
		</div>
	)
}
