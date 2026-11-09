import { Router } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

import { asyncHandler } from '../utils/async-handler.js'

function getParam(value: string | string[] | undefined): string {
	if (typeof value !== 'string') {
		throw new Error('Invalid route parameter')
	}

	return value
}

export function createApplicationRouter(core: CoreNebula): Router {
	const router = Router()

	// Create application
	router.post(
		'/',
		asyncHandler(async (req, res) => {
			const application = await core.application.create(req.body)

			res.status(201).json({
				success: true,
				data: application,
			})
		}),
	)

	// Get all applications
	router.get(
		'/',
		asyncHandler(async (_req, res) => {
			const applications = await core.application.getAll()

			res.json({
				success: true,
				data: applications,
			})
		}),
	)

	// Get application
	router.get(
		'/:id',
		asyncHandler(async (req, res) => {
			const id = getParam(req.params.id)
			const application = await core.application.get(id)

			res.json({
				success: true,
				data: application,
			})
		}),
	)

	// Update application
	router.patch(
		'/:id',
		asyncHandler(async (req, res) => {
			const id = getParam(req.params.id)
			const application = await core.application.update(id, req.body)

			res.json({
				success: true,
				data: application,
			})
		}),
	)

	// Delete application
	router.delete(
		'/:id',
		asyncHandler(async (req, res) => {
			const id = getParam(req.params.id)
			await core.application.delete(id)

			res.json({
				success: true,
			})
		}),
	)

	return router
}
