import { useState } from 'react'

import { updateApplication } from '../../../lib/api/applications'
import type { Application } from '../../../types/application'

import styles from '../application-modal/ApplicationModal.module.css'

interface EditApplicationProps {
	application: Application
	onClose: () => void
	onUpdated: (application: Application) => void
}

export default function EditApplication({ application, onClose, onUpdated }: EditApplicationProps) {
	const [name, setName] = useState(application.name)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const trimmedName = name.trim()
		if (!trimmedName) return

		setSaving(true)
		setError('')

		try {
			const updated = await updateApplication(application.id, {
				name: trimmedName,
			})

			if (!updated) {
				setError('Failed to update application.')
				return
			}

			onUpdated(updated)
			onClose()
		} catch (error) {
			console.error('[EditApplication] Update failed:', error)
			setError('An unexpected error occurred while updating the application.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div
			className={styles.modalOverlay}
			onMouseDown={(e) => {
				if (e.target === e.currentTarget && !saving) onClose()
			}}
		>
			<div className={styles.modal}>
				<div className={styles.modalHeader}>
					<div>
						<h3>Edit Application</h3>
						<p>Update your application details.</p>
					</div>

					<button className={styles.closeButton} onClick={onClose} disabled={saving} type="button">
						×
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<label htmlFor="editAppName">Application Name</label>

					<input
						id="editAppName"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						autoFocus
					/>

					{error && <p className={styles.error}>{error}</p>}

					<div className={styles.modalActions}>
						<button
							type="button"
							className={styles.cancelButton}
							onClick={onClose}
							disabled={saving}
						>
							Cancel
						</button>

						<button type="submit" className={styles.submitButton} disabled={saving || !name.trim()}>
							{saving ? 'Saving...' : 'Save changes'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
