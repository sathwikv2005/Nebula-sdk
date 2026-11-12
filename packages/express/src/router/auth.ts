import { Router } from 'express'
import { type Nebula as CoreNebula } from '@nebula-sdk/core'
import type { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'

import { asyncHandler } from '../utils/async-handler.js'
import { NebulaExpressError } from '../errors/expressError.js'
import { NebulaExpressErrorCode } from '../errors/errorCode.js'

const authenticationLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 5,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: {
		success: false,
		error: {
			code: 'TOO_MANY_REQUESTS',
			message: 'Too many authentication attempts. Please try again later.',
		},
	},
})

const challengeLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 10,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: {
		success: false,
		error: {
			code: 'TOO_MANY_REQUESTS',
			message: 'Too many challenge requests. Please try again later.',
		},
	},
})

function validateDeviceId(deviceId: unknown): deviceId is string {
	return typeof deviceId === 'string' && deviceId.length > 0 && deviceId.length <= 128
}

export function createAuthRouter(core: CoreNebula): Router {
	const router = Router()

	router.get(
		'/challenge/:deviceId',
		challengeLimiter,
		asyncHandler(async (req: Request, res: Response) => {
			const { deviceId } = req.params

			if (!validateDeviceId(deviceId)) {
				throw new NebulaExpressError('Invalid device ID.', NebulaExpressErrorCode.INVALID_REQUEST)
			}

			const challenge = await core.authentication.generateChallenge(deviceId)

			res.status(200).json({
				success: true,
				challenge,
			})
		}),
	)

	router.post(
		'/verify/:deviceId',
		authenticationLimiter,
		asyncHandler(async (req: Request, res: Response) => {
			const body: unknown = req.body
			const { deviceId } = req.params

			if (!validateDeviceId(deviceId)) {
				throw new NebulaExpressError('Invalid device ID.', NebulaExpressErrorCode.INVALID_REQUEST)
			}

			if (!body || typeof body !== 'object' || Array.isArray(body)) {
				throw new NebulaExpressError(
					'Invalid request body.',
					NebulaExpressErrorCode.INVALID_REQUEST,
				)
			}

			const { challenge, signature } = body as Record<string, unknown>

			if (
				typeof challenge !== 'string' ||
				typeof signature !== 'string' ||
				!challenge.length ||
				!signature.length
			) {
				throw new NebulaExpressError(
					'Invalid request body.',
					NebulaExpressErrorCode.INVALID_REQUEST,
				)
			}

			const token = await core.authentication.verifyChallenge(deviceId, challenge, signature)

			res.status(200).json({
				success: true,
				token,
			})
		}),
	)

	return router
}
