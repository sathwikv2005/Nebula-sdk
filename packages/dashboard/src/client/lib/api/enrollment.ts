import type { ApiResponse } from '../../types/apiResponse'
import type { Device } from '../../types/device'
import type { Enrollment, EnrollmentRequest, EnrollmentWindow } from '../../types/enrollment'
import { nebulaRequest } from './request'

export async function getEnrollmentWindow(): Promise<EnrollmentWindow | null> {
	const res = await nebulaRequest('/enrollment/window')

	if (!res?.ok) return null

	const result: ApiResponse<EnrollmentWindow> = await res.json()
	return result.data ?? null
}

export async function getEnrollmentRequests(): Promise<EnrollmentRequest[] | null> {
	const res = await nebulaRequest('/enrollment/requests')

	if (!res?.ok) return null

	const result: ApiResponse<EnrollmentRequest[]> = await res.json()
	return result.data ?? null
}

export async function enableEnrollment(): Promise<Enrollment | null> {
	const res = await nebulaRequest('/enrollment/enable', {
		method: 'POST',
	})

	if (!res?.ok) return null

	const result: ApiResponse<Enrollment> = await res.json()
	return result.data ?? null
}

export async function disableEnrollment(): Promise<boolean> {
	const res = await nebulaRequest('/enrollment/disable', {
		method: 'POST',
	})

	return res?.ok ?? false
}

export async function approveEnrollment(
	requestId: string,
	applicationId: string,
): Promise<Device | null> {
	const res = await nebulaRequest(`/enrollment/requests/${encodeURIComponent(requestId)}/approve`, {
		method: 'POST',
		body: JSON.stringify({ applicationId }),
	})

	if (!res?.ok) return null

	const result: ApiResponse<Device> = await res.json()
	return result.data ?? null
}
