import type { ApiResponse } from '../types/apiResponse'
import type { Device } from '../types/device'
import type { Enrollment } from '../types/enrollment'
import { nebulaRequest } from './request'

export async function enableEnrollment(applicationId: string): Promise<Enrollment | null> {
	const res = await nebulaRequest(
		`/applications/${encodeURIComponent(applicationId)}/enrollment/enable`,
		{ method: 'POST' },
	)

	if (!res?.ok) return null

	const result: ApiResponse<Enrollment> = await res.json()
	return result.data ?? null
}

export async function disableEnrollment(applicationId: string): Promise<boolean> {
	const res = await nebulaRequest(
		`/applications/${encodeURIComponent(applicationId)}/enrollment/disable`,
		{ method: 'POST' },
	)

	return res?.ok ?? false
}

export async function approveEnrollment(
	applicationId: string,
	code: string,
): Promise<unknown | null> {
	const res = await nebulaRequest(
		`/applications/${encodeURIComponent(applicationId)}/enrollment/approve`,
		{
			method: 'POST',
			body: JSON.stringify({ code }),
		},
	)

	if (!res?.ok) return null

	const result: ApiResponse<Device> = await res.json()
	return result.data ?? null
}
