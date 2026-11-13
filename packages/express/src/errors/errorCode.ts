export const NebulaExpressErrorCode = {
	INVALID_REQUEST: 'INVALID_REQUEST',
	NOT_FOUND: 'NOT_FOUND',
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
} as const

export type NebulaExpressErrorCode =
	(typeof NebulaExpressErrorCode)[keyof typeof NebulaExpressErrorCode]
