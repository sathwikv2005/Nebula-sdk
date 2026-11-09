import type { ErrorRequestHandler } from 'express'
import { NebulaError } from '@nebula-sdk/core'

function getStatusCode(error: NebulaError): number {
	switch (error.code) {
		case 'AUTHENTICATION_ERROR':
			return 401

		case 'CONFIGURATION_ERROR':
			return 500

		default:
			return 400
	}
}

export const defaultErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
	if (error instanceof NebulaError) {
		return res.status(getStatusCode(error)).json({
			success: false,
			error: {
				code: error.code,
				message: error.message,
			},
		})
	}

	// Unexpected errors
	return res.status(500).json({
		success: false,
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'An unexpected error occurred',
		},
	})
}
