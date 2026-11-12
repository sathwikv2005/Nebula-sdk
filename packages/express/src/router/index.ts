import express, { type Router } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'
import type { ErrorRequestHandler, RequestHandler } from 'express'

import { createApplicationRouter } from './applications.js'
import { createEnrollmentRouter } from './enrollment.js'
import { defaultErrorHandler } from '../middleware/error-handler.js'
import { createAuthRouter } from './auth.js'

const ROUTE_PREFIX = '/_nebula'

export function createNebulaRouter(
	core: CoreNebula,
	adminAuth: RequestHandler,
	errorHandler?: ErrorRequestHandler,
	enableDeviceAuthOnAllRoutes?: boolean,
): Router {
	const router = express.Router()
	const nebulaRouter = express.Router()

	nebulaRouter.use(express.json())

	nebulaRouter.use('/auth', createAuthRouter(core))
	nebulaRouter.use('/applications', adminAuth, createApplicationRouter(core))
	nebulaRouter.use('/', createEnrollmentRouter(core, adminAuth))

	router.use(ROUTE_PREFIX, nebulaRouter)

	// Application-wide device authentication
	if (enableDeviceAuthOnAllRoutes) {
		// router.use(authDevice)
	}

	router.use(errorHandler ?? defaultErrorHandler)

	return router
}
