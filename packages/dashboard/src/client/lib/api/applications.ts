import type { ApiResponse } from '../../types/apiResponse'
import type { Application } from '../../types/application'
import { nebulaRequest } from './request'

const ROUTE = '/applications'

export async function createApplication(
	payload: Partial<Application>,
): Promise<Application | null> {
	const res = await nebulaRequest(ROUTE, {
		method: 'POST',
		body: JSON.stringify(payload),
	})

	if (!res?.ok) return null

	const result: ApiResponse<Application> = await res.json()
	return result.data ?? null
}

export async function getApplications(): Promise<Application[] | null> {
	const res = await nebulaRequest(ROUTE)

	if (!res?.ok) return null

	const result: ApiResponse<Application[]> = await res.json()
	return result.data ?? null
}

export async function getApplication(id: string): Promise<Application | null> {
	const res = await nebulaRequest(`${ROUTE}/${encodeURIComponent(id)}`)

	if (!res?.ok) return null

	const result: ApiResponse<Application> = await res.json()
	return result.data ?? null
}

export async function updateApplication(
	id: string,
	payload: Partial<Application>,
): Promise<Application | null> {
	const res = await nebulaRequest(`${ROUTE}/${encodeURIComponent(id)}`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
	})

	if (!res?.ok) return null

	const result: ApiResponse<Application> = await res.json()
	return result.data ?? null
}

export async function deleteApplication(id: string): Promise<boolean> {
	const res = await nebulaRequest(`${ROUTE}/${encodeURIComponent(id)}`, {
		method: 'DELETE',
	})

	if (!res?.ok) return false

	const result: ApiResponse<null> = await res.json()
	return result.success
}
