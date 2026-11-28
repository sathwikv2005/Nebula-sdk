import type { Application } from '../../../types/application'
import { formatDate } from '../../../utils/dashboard'

import styles from './ApplicationItem.module.css'

interface ApplicationItemProps {
	application: Application
}

export default function ApplicationItem({ application }: ApplicationItemProps) {
	return (
		<div className={styles.listItem}>
			<div className={styles.itemIcon}>▦</div>

			<div className={styles.itemDetails}>
				<strong>{application.name}</strong>
				<span>ID: {application.id}</span>
			</div>

			<span className={styles.itemDate}>{formatDate(application.createdAt)}</span>
		</div>
	)
}
