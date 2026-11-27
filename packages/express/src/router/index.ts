import express, { type Router } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'
import type { ErrorRequestHandler, RequestHandler } from 'express'

import { createApplicationRouter } from './applications.js'
import { createEnrollmentRouter } from './enrollment.js'
import { defaultErrorHandler } from '../middleware/error-handler.js'
import { createAuthRouter } from './auth.js'
import { createAuthDeviceMiddleware } from '../api/authDevice.js'
import { AdminMongoAdapter } from '../storage/mongodb/adapter.js'
import { createAdminRouter } from './admin.js'
import { createDashboardRouter } from '@nebula-sdk/dashboard'
import { createDeviceRouter } from './device.js'

const ROUTE_PREFIX = '/_nebula'

export function createNebulaRouter(
	core: CoreNebula,
	adminAuth: RequestHandler,
	adminStorage?: AdminMongoAdapter,
	errorHandler?: ErrorRequestHandler,
	enableDeviceAuthOnAllRoutes?: boolean,
): Router {
	const router = express.Router()
	const nebulaRouter = express.Router()

	nebulaRouter.use(express.json())

	//dashboard
	nebulaRouter.use('/dashboard', createDashboardRouter({ apiRoute: `${ROUTE_PREFIX}` }))

	nebulaRouter.use('/admin', createAdminRouter(adminAuth, adminStorage))
	nebulaRouter.use('/auth', createAuthRouter(core))
	nebulaRouter.use('/applications', adminAuth, createApplicationRouter(core))
	nebulaRouter.use('/device', adminAuth, createDeviceRouter(core))
	nebulaRouter.use('/', createEnrollmentRouter(core, adminAuth))

	router.use(ROUTE_PREFIX, nebulaRouter)

	// Application-wide device authentication
	if (enableDeviceAuthOnAllRoutes) {
		router.use(createAuthDeviceMiddleware((token) => core.session.validateSession(token)))
	}

	router.use(errorHandler ?? defaultErrorHandler)

	return router
}
