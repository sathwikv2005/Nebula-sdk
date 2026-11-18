import { nebulaRequest } from './request'

export async function login(username: string, password: string): Promise<Boolean> {
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

export async function logout(): Promise<Boolean> {
	const res = await nebulaRequest('/admin/logout', {
		method: 'POST',
	})
	if (!res) return false

	if (res.status === 200) return true

	const data = await res.json()
	console.error(data.message ?? data.error ?? `Logout request failed ${res.status}`)

	return false
}
