import type { ApiResponse } from '../../types/apiResponse'
import type { Device } from '../../types/device'
import { nebulaRequest } from './request'

const ROUTE = '/device'

export async function getDevices(): Promise<Device[] | null> {
	const res = await nebulaRequest(ROUTE)

	if (!res?.ok) return null

	const result: ApiResponse<Device[]> = await res.json()
	return result.data ?? null
}

export async function getDevice(id: string): Promise<Device | null> {
	const res = await nebulaRequest(`${ROUTE}/${encodeURIComponent(id)}`)

	if (!res?.ok) return null

	const result: ApiResponse<Device> = await res.json()
	return result.data ?? null
}

export async function getApplicationDevices(applicationId: string): Promise<Device[] | null> {
	const res = await nebulaRequest(`${ROUTE}/application/${encodeURIComponent(applicationId)}`)

	if (!res?.ok) return null

	const result: ApiResponse<Device[]> = await res.json()
	return result.data ?? null
}
