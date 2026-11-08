export type DeviceStatus = 'active' | 'revoked'

export interface DeviceInfo {
	name?: string
	platform?: string
	os?: string
	osVersion?: string
	appVersion?: string
	[key: string]: unknown
}

export interface Device {
	id: string
	applicationId: string
	publicKey: string
	algorithm: 'Ed25519'
	info: DeviceInfo
	status: DeviceStatus
	createdAt: number
	lastAuthenticatedAt: number | null
}
