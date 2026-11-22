import { Router } from 'express'
import type { Request, Response, RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

import { asyncHandler } from '../utils/async-handler.js'
import { parseDeviceInfo } from '../utils/parseDeviceInfo.js'

const enrollmentLimiter = rateLimit({
	windowMs: 60 * 1000,
	limit: 5,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	message: {
		success: false,
		error: {
			code: 'TOO_MANY_REQUESTS',
			message: 'Too many enrollment attempts. Please try again later.',
		},
	},
})

function getString(value: unknown, field: string, res: Response): string | null {
	if (typeof value !== 'string' || !value.trim()) {
		res.status(400).json({
			success: false,
			error: {
				code: `INVALID_${field.toUpperCase()}`,
				message: `A valid ${field} is required`,
			},
		})
		return null
	}

	return value.trim()
}

export function createEnrollmentRouter(core: CoreNebula, adminAuth: RequestHandler): Router {
	const router = Router()

	// Public: a new device requests enrollment.
	router.post(
		'/enrollment/request',
		enrollmentLimiter,
		asyncHandler(async (req, res) => {
			const { code, publicKey, info } = req.body ?? {}

			await core.enrollment.request({
				code,
				publicKey,
				info: parseDeviceInfo(info),
			})

			res.status(202).json({
				success: true,
				message: 'Enrollment request submitted',
			})
		}),
	)

	// Admin: enable the global enrollment window.
	router.post(
		'/enrollment/enable',
		adminAuth,
		asyncHandler(async (_req, res) => {
			const enrollment = await core.enrollment.enable()

			res.status(200).json({
				success: true,
				data: enrollment,
			})
		}),
	)

	// Admin: disable the global enrollment window.
	router.post(
		'/enrollment/disable',
		adminAuth,
		asyncHandler(async (_req, res) => {
			await core.enrollment.disable()

			res.status(200).json({
				success: true,
				message: 'Device enrollment disabled',
			})
		}),
	)

	// Admin: approve a pending request and assign it to an application.
	router.post(
		'/enrollment/requests/:requestId/approve',
		adminAuth,
		asyncHandler(async (req, res) => {
			const requestId = getString(req.params.requestId, 'requestId', res)
			if (!requestId) return

			const applicationId = getString(req.body?.applicationId, 'applicationId', res)
			if (!applicationId) return

			const device = await core.enrollment.approve(requestId, applicationId)

			res.status(201).json({
				success: true,
				data: device,
			})
		}),
	)

	return router
}
