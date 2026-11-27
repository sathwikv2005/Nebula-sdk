import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { checkSession, login as loginRequest, logout as logoutRequest } from '../lib/api/auth'

interface AuthContextType {
	isAuthenticated: boolean
	isLoading: boolean
	login: (username: string, password: string) => Promise<boolean>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		checkSession()
			.then(setIsAuthenticated)
			.catch(() => setIsAuthenticated(false))
			.finally(() => setIsLoading(false))
	}, [])

	useEffect(() => {
		const handleUnauthorized = () => {
			setIsAuthenticated(false)
		}

		window.addEventListener('nebula:unauthorized', handleUnauthorized)

		return () => {
			window.removeEventListener('nebula:unauthorized', handleUnauthorized)
		}
	}, [])

	async function login(username: string, password: string) {
		const success = await loginRequest(username, password)

		if (success) setIsAuthenticated(true)

		return success
	}

	async function logout() {
		await logoutRequest()
		setIsAuthenticated(false)
	}

	return (
		<AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)

	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}

	return context
}
