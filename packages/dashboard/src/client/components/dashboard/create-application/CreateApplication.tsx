import { useState } from 'react'

import { createApplication } from '../../../lib/api/applications'
import type { Application } from '../../../types/application'

import styles from '../application-modal/ApplicationModal.module.css'

interface CreateApplicationProps {
	onClose: () => void
	onCreated: (application: Application) => void
}

export default function CreateApplication({ onClose, onCreated }: CreateApplicationProps) {
	const [name, setName] = useState('')
	const [creating, setCreating] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		const trimmedName = name.trim()
		if (!trimmedName) return

		setCreating(true)
		setError('')

		try {
			const application = await createApplication({ name: trimmedName })

			if (!application) {
				setError('Failed to create application.')
				return
			}

			onCreated(application)
			onClose()
		} catch {
			setError('An unexpected error occurred while creating the application.')
		} finally {
			setCreating(false)
		}
	}

	return (
		<div
			className={styles.modalOverlay}
			onMouseDown={(e) => {
				if (e.target === e.currentTarget && !creating) onClose()
			}}
		>
			<div className={styles.modal}>
				<div className={styles.modalHeader}>
					<div>
						<h3>Create Application</h3>
						<p>Register a new application with Nebula.</p>
					</div>

					<button
						className={styles.closeButton}
						onClick={onClose}
						disabled={creating}
						type="button"
					>
						×
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<label htmlFor="createAppName">Application Name</label>

					<input
						id="createAppName"
						type="text"
						placeholder="e.g. My Application"
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
							disabled={creating}
						>
							Cancel
						</button>

						<button
							type="submit"
							className={styles.submitButton}
							disabled={creating || !name.trim()}
						>
							{creating ? 'Creating...' : 'Create application'}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
