import { nebulaRequest } from './request'

export async function login(username: string, password: string): Promise<boolean> {
	if (
		typeof username !== 'string' ||
		typeof password !== 'string' ||
		!username.trim() ||
		!password
	) {
		console.error('Username and password are required.')
		return false
	}

	const payload = {
		username,
		password,
	}

	const res = await nebulaRequest('/admin/login', {
		method: 'POST',
		body: JSON.stringify(payload),
	})
	if (!res) return false

	if (res.status === 200) return true

	const data = await res.json()
	console.error(data.message ?? data.error ?? `Login request failed ${res.status}`)

	return false
}

export async function logout(): Promise<boolean> {
	const res = await nebulaRequest('/admin/logout', {
		method: 'POST',
	})
	if (!res) return false

	if (res.status === 200) return true

	const data = await res.json()
	console.error(data.message ?? data.error ?? `Logout request failed ${res.status}`)

	return false
}

export async function checkSession(): Promise<boolean> {
	const res = await nebulaRequest('/admin/session')

	return res?.status === 200
}
