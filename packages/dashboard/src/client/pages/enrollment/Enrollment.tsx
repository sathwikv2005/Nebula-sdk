import EmptyState from '../../components/dashboard/empty-state/EmptyState'
import styles from './Enrollment.module.css'

export default function Enrollment() {
	return (
		<section className={styles.panel}>
			<div className={styles.panelHeader}>
				<div>
					<h2>Device enrollment</h2>
					<p>Manage incoming device enrollment requests.</p>
				</div>
			</div>

			<EmptyState message="Enrollment management is coming soon." />
		</section>
	)
}
