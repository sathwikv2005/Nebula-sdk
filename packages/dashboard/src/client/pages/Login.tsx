import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

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
		<div className="login-page">
			<div className="login-card">
				<div className="login-brand">
					<div className="login-logo">N</div>
					<h1>Nebula</h1>
					<span>ADMIN CONSOLE</span>
				</div>

				<div className="login-heading">
					<h2>Welcome back</h2>
					<p>Sign in to manage your Nebula instance.</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="form-field">
						<label htmlFor="username">Username</label>
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

					<div className="form-field">
						<label htmlFor="password">Password</label>
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

					{error && <div className="login-error">{error}</div>}

					<button type="submit" disabled={loading}>
						{loading ? 'Authenticating...' : 'Sign in'}
						{!loading && <span>→</span>}
					</button>
				</form>

				<div className="login-footer">Protected by Nebula Device Identity</div>
			</div>
		</div>
	)
}
