import type { ErrorRequestHandler } from 'express'
import { NebulaError, NebulaErrorCode } from '@nebula-sdk/core'
import { NebulaExpressError } from '../errors/expressError'
import { NebulaExpressErrorCode } from '../errors/errorCode'

function getStatusCode(error: NebulaError): number {
	switch (error.code) {
		case NebulaErrorCode.AUTHENTICATION:
			return 401

		case NebulaErrorCode.CONFIGURATION:
			return 500

		case NebulaErrorCode.VALIDATION:
			return 400

		case NebulaErrorCode.APPLICATION:
		case NebulaErrorCode.DEVICE:
		case NebulaErrorCode.ENROLLMENT:
		case NebulaErrorCode.SESSION:
			return 400

		default:
			return 500
	}
}

function getExpressStatusCode(error: NebulaExpressError): number {
	switch (error.code) {
		case NebulaExpressErrorCode.INVALID_REQUEST:
			return 400

		case NebulaExpressErrorCode.NOT_FOUND:
			return 404

		case NebulaExpressErrorCode.AUTHENTICATION_REQUIRED:
			return 401

		case NebulaExpressErrorCode.INTERNAL_SERVER_ERROR:
			return 500
	}
}

export const defaultErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
	if (error instanceof NebulaExpressError) {
		return res.status(getExpressStatusCode(error)).json({
			success: false,
			error: {
				code: error.code,
				message: error.message,
			},
		})
	}

	if (error instanceof NebulaError) {
		return res.status(getStatusCode(error)).json({
			success: false,
			error: {
				code: error.code,
				message: error.message,
			},
		})
	}

	console.error(error)

	return res.status(500).json({
		success: false,
		error: {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'An unexpected error occurred',
		},
	})
}
