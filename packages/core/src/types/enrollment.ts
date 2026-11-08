import type { DeviceInfo } from './device.js'

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface EnrollmentRequest {
	id: string
	applicationId: string
	codeHash: string
	publicKey: string
	info: DeviceInfo
	status: EnrollmentStatus
	createdAt: number
	expiresAt: number
}
