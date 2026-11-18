export interface Application {
	id: string
	name: string
	enrollmentEnabled: boolean
	enrollmentExpiresAt: number | null
	enrollmentRequestId: string | null
	createdAt: number
	updatedAt: number
}
