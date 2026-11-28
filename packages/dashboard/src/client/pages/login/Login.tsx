import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'

import styles from './Login.module.css'

export default function Login() {
	const { login, isAuthenticated } = useAuth()
	const navigate = useNavigate()

	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	if (isAuthenticated) return <Navigate to="/" replace />

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault()

		if (!username.trim() || !password) {
			setError('Please enter your username and password.')
			return
		}

		setError('')
		setLoading(true)

		try {
			const success = await login(username, password)

			if (success) {
				navigate('/', { replace: true })
			} else {
				setError('Invalid username or password.')
			}
		} catch {
			setError('Unable to connect to the server.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className={styles.page}>
			<div className={styles.glow} />

			<section className={styles.card}>
				<header className={styles.brand}>
					<div className={styles.brandText}>
						<h1>Nebula</h1>
						<span>ADMIN CONSOLE</span>
					</div>
				</header>

				<div className={styles.divider} />

				<div className={styles.heading}>
					<h2>Welcome back.</h2>
				</div>

				<form className={styles.form} onSubmit={handleSubmit}>
					<div className={styles.field}>
						<label htmlFor="username">Username</label>

						<div className={styles.inputWrapper}>
							<svg viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="8" r="4" />
								<path d="M5 21v-2a7 7 0 0 1 14 0v2" />
							</svg>

							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Enter your username"
								autoComplete="username"
								autoFocus
								required
							/>
						</div>
					</div>

					<div className={styles.field}>
						<label htmlFor="password">Password</label>

						<div className={styles.inputWrapper}>
							<svg viewBox="0 0 24 24" fill="none">
								<rect x="4" y="10" width="16" height="11" rx="2" />
								<path d="M8 10V7a4 4 0 1 1 8 0v3" />
							</svg>

							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter your password"
								autoComplete="current-password"
								required
							/>
						</div>
					</div>

					{error && (
						<div className={styles.error} role="alert">
							<svg viewBox="0 0 24 24" fill="none">
								<circle cx="12" cy="12" r="9" />
								<path d="M12 8v5m0 3h.01" />
							</svg>
							{error}
						</div>
					)}

					<button className={styles.submit} type="submit" disabled={loading}>
						{loading ? (
							<>
								<span className={styles.spinner} />
								Authenticating...
							</>
						) : (
							<>
								Sign in to dashboard
								<span className={styles.arrow}>→</span>
							</>
						)}
					</button>
				</form>

				<footer className={styles.footer}>
					<span className={styles.version}>NEBULA CONSOLE</span>
				</footer>
			</section>

			<div className={styles.bottomText}>
				<span>SECURE</span>
				<span className={styles.bottomSeparator}>·</span>
				<span>PRIVATE</span>
				<span className={styles.bottomSeparator}>·</span>
				<span>SELF-HOSTED</span>
			</div>
		</main>
	)
}
