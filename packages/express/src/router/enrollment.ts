import { Router } from 'express'
import type { Request, Response, RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

import { asyncHandler } from '../utils/async-handler.js'

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

function getApplicationId(req: Request, res: Response): string | null {
	const id = req.params.applicationId

	if (typeof id !== 'string' || !id.trim()) {
		res.status(400).json({
			success: false,
			error: {
				code: 'INVALID_APPLICATION_ID',
				message: 'A valid application ID is required',
			},
		})
		return null
	}

	return id
}

export function createEnrollmentRouter(core: CoreNebula, adminAuth: RequestHandler): Router {
	const router = Router()

	// Public: a new device requests enrollment.
	router.post(
		'/enrollment/request',
		enrollmentLimiter,
		asyncHandler(async (req, res) => {
			const { applicationId, code, publicKey, info } = req.body ?? {}

			await core.enrollment.request({
				applicationId,
				code,
				publicKey,
				info,
			})

			res.status(202).json({
				success: true,
				message: 'Enrollment request submitted',
			})
		}),
	)

	// Admin: enable device enrollment.
	router.post(
		'/applications/:applicationId/enrollment/enable',
		adminAuth,
		asyncHandler(async (req, res) => {
			const applicationId = getApplicationId(req, res)
			if (!applicationId) return

			const enrollment = await core.enrollment.enable(applicationId)

			res.status(200).json({
				success: true,
				data: enrollment,
			})
		}),
	)

	// Admin: disable device enrollment.
	router.post(
		'/applications/:applicationId/enrollment/disable',
		adminAuth,
		asyncHandler(async (req, res) => {
			const applicationId = getApplicationId(req, res)
			if (!applicationId) return

			await core.enrollment.disable(applicationId)

			res.status(200).json({
				success: true,
				message: 'Device enrollment disabled',
			})
		}),
	)

	// Admin: approve a pending enrollment request.
	router.post(
		'/applications/:applicationId/enrollment/approve',
		adminAuth,
		asyncHandler(async (req, res) => {
			const applicationId = getApplicationId(req, res)
			if (!applicationId) return

			const { code } = req.body ?? {}

			const device = await core.enrollment.approve(applicationId, code)

			res.status(201).json({
				success: true,
				data: device,
			})
		}),
	)

	return router
}
