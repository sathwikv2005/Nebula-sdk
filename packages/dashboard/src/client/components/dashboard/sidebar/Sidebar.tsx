import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

import styles from './Sidebar.module.css'

type Section = {
	label: string
	icon: string
	path: string
}

const navigation: Section[] = [
	{ label: 'Overview', icon: '◫', path: '/' },
	{ label: 'Applications', icon: '▦', path: '/applications' },
	{ label: 'Devices', icon: '▣', path: '/devices' },
	{ label: 'Enrollment', icon: '⌁', path: '/enrollment' },
	{ label: 'Settings', icon: '⚙', path: '/settings' },
]

interface SidebarProps {
	onLogout: () => void | Promise<void>
}

export default function Sidebar({ onLogout }: SidebarProps) {
	const location = useLocation()
	const [loggingOut, setLoggingOut] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)

	useEffect(() => {
		setMenuOpen(false)
	}, [location.pathname])

	useEffect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : ''

		return () => {
			document.body.style.overflow = ''
		}
	}, [menuOpen])

	async function handleLogout() {
		if (loggingOut) return

		setLoggingOut(true)

		try {
			await onLogout()
		} finally {
			setLoggingOut(false)
			setMenuOpen(false)
		}
	}

	return (
		<>
			<button
				className={styles.menuButton}
				onClick={() => setMenuOpen(true)}
				aria-label="Open navigation menu"
				aria-expanded={menuOpen}
			>
				<span />
				<span />
				<span />
			</button>

			{menuOpen && (
				<button
					className={styles.backdrop}
					onClick={() => setMenuOpen(false)}
					aria-label="Close navigation menu"
				/>
			)}

			<aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
				<div className={styles.brand}>
					<div className={styles.brandMark}>N</div>
					<span>Nebula</span>
					<span className={styles.brandVersion}>ADMIN</span>

					<button
						className={styles.closeButton}
						onClick={() => setMenuOpen(false)}
						aria-label="Close navigation menu"
					>
						×
					</button>
				</div>

				<div className={styles.navLabel}>MENU</div>

				<nav className={styles.navigation}>
					{navigation.map((item) => {
						const active = location.pathname === item.path

						return (
							<Link
								key={item.path}
								to={item.path}
								className={`${styles.navItem} ${active ? styles.navActive : ''}`}
								aria-current={active ? 'page' : undefined}
							>
								<span className={styles.navIcon}>{item.icon}</span>
								{item.label}
								{active && <span className={styles.navIndicator} />}
							</Link>
						)
					})}
				</nav>

				<div className={styles.sidebarBottom}>
					<div className={styles.adminInfo}>
						<div className={styles.adminAvatar}>A</div>
						<div>
							<strong>Administrator</strong>
							<span>System admin</span>
						</div>
					</div>

					<button className={styles.logoutButton} onClick={handleLogout} disabled={loggingOut}>
						<span>↪</span>
						{loggingOut ? 'Logging out...' : 'Logout'}
					</button>
				</div>
			</aside>
		</>
	)
}
