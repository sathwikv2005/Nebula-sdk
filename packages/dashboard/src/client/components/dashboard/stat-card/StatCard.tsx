import type { ReactNode } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
	label: string
	value: number
	description: string
	icon: ReactNode
	variant?: 'success' | 'danger'
}

export default function StatCard({ label, value, description, icon, variant }: StatCardProps) {
	return (
		<div className={styles.statCard}>
			<div className={styles.statTop}>
				<span>{label}</span>

				<span
					className={`${styles.statIcon} ${
						variant === 'success' ? styles.success : variant === 'danger' ? styles.danger : ''
					}`}
				>
					{icon}
				</span>
			</div>

			<strong className={styles.statValue}>{value}</strong>
			<span className={styles.statDescription}>{description}</span>
		</div>
	)
}
