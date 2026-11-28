import EmptyState from '../../components/dashboard/empty-state/EmptyState'
import styles from './Settings.module.css'

export default function Settings() {
	return (
		<section className={styles.panel}>
			<div className={styles.panelHeader}>
				<div>
					<h2>Settings</h2>
					<p>Manage your Nebula dashboard.</p>
				</div>
			</div>

			<EmptyState message="Dashboard settings are coming soon." />
		</section>
	)
}
