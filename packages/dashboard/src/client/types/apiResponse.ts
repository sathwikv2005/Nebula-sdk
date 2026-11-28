export interface ApiResponse<T> {
	success: boolean
	data?: T
	message?: string
	error?: { code: string; message: string }
}
