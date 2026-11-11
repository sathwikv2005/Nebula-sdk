export interface Session {
	id: string
	tokenHash: string
	deviceId: string
	applicationId: string
	createdAt: number
	expiresAt: number
}
