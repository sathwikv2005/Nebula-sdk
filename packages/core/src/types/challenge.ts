export interface Challenge {
	id: string
	deviceId: string
	applicationId: string
	challengeHash: string
	expiresAt: number
	consumedAt?: number
}
