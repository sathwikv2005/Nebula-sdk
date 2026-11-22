import { Device } from './device.js'

export type PublicSession = Omit<Session, 'tokenHash'>

export interface Session {
	id: string
	tokenHash: string
	deviceId: string
	applicationId: string
	createdAt: number
	expiresAt: number
}

export interface SessionWithDevice {
	session: PublicSession
	device?: Device
}
