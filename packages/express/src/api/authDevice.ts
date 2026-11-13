import type { RequestHandler } from 'express'
import type { Session } from '@nebula-sdk/core'

import { NebulaExpressError } from '../errors/expressError.js'
import { NebulaExpressErrorCode } from '../errors/errorCode.js'

type SessionValidator = (token: string) => Promise<Session>

export function createAuthDeviceMiddleware(validateSession: SessionValidator): RequestHandler {
	return async (req, _res, next) => {
		const token = req.get('X-Nebula-Token')

		if (!token) {
			return next(
				new NebulaExpressError(
					'Authentication required.',
					NebulaExpressErrorCode.AUTHENTICATION_REQUIRED,
				),
			)
		}

		try {
			const session = await validateSession(token)

			req.nebula = { session }

			next()
		} catch (error) {
			next(error)
		}
	}
}
