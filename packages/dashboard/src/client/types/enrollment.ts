import type { DeviceInfo } from './device'

export interface Enrollment {
	expiresAt: number
}

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface EnrollmentRequest {
	id: string
	publicKey: string
	info: DeviceInfo
	status: EnrollmentStatus
	createdAt: number
	expiresAt: number
}
