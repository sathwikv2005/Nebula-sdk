import type { RequestHandler } from 'express'
import type { SessionWithDevice } from '@nebula-sdk/core'

import { NebulaExpressError } from '../errors/expressError.js'
import { NebulaExpressErrorCode } from '../errors/errorCode.js'
import { NebulaExpressSession } from '../types/nebulaExpressSession.js'

type SessionValidator = (token: string) => Promise<SessionWithDevice>

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
			const { ...sessionData } = await validateSession(token)

			const session: NebulaExpressSession = sessionData.session

			req.nebula = { session, device: sessionData.device }

			next()
		} catch (error) {
			next(error)
		}
	}
}
