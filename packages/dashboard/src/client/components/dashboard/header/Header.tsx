import { useLocation } from 'react-router'

import styles from './Header.module.css'

const pageTitles: Record<string, string> = {
	'/': 'Overview',
	'/applications': 'Applications',
	'/devices': 'Devices',
	'/enrollment': 'Enrollment',
	'/settings': 'Settings',
}

export default function Header() {
	const location = useLocation()
	const title = pageTitles[location.pathname] ?? 'Dashboard'

	return (
		<header className={styles.header}>
			<div>
				<div className={styles.breadcrumb}>
					<span>NEBULA</span>
					<span>/</span>
					<span>{title}</span>
				</div>

				<h1>{title}</h1>
			</div>

			<div className={styles.headerRight}>
				<div className={styles.connectionStatus}>
					<span />
					Connected
				</div>
			</div>
		</header>
	)
}
