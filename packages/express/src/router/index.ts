import express, { type Router } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'
import type { ErrorRequestHandler, RequestHandler } from 'express'

import { createApplicationRouter } from './applications.js'
import { createEnrollmentRouter } from './enrollment.js'
import { defaultErrorHandler } from '../middleware/error-handler.js'

export function createNebulaRouter(
	core: CoreNebula,
	adminAuth: RequestHandler,
	errorHandler?: ErrorRequestHandler,
): Router {
	const router = express.Router()

	router.use(express.json())

	router.use('/applications', adminAuth, createApplicationRouter(core))
	router.use(createEnrollmentRouter(core, adminAuth))

	router.use(errorHandler ?? defaultErrorHandler)

	return router
}
