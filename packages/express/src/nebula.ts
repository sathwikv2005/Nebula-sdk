import { RequestHandler, type Router } from 'express'
import { createConnection, type Connection } from 'mongoose'

import { Nebula as CoreNebula } from '@nebula-sdk/core'
import { MongooseAdapter } from '@nebula-sdk/mongoose'

import type { AdminCredentials, NebulaOptions } from './types/config.js'
import { createNebulaRouter } from './router/index.js'
import { createAuthDeviceMiddleware } from './api/authDevice.js'
import { AdminMongoAdapter } from './storage/mongodb/adapter.js'
import { createAdminAuthMiddleware } from './middleware/adminAuth.js'

export class Nebula {
	private readonly core: CoreNebula
	private readonly connection: Connection
	private readonly ownsConnection: boolean
	private readonly routerInstance: Router
	private readonly adminStorage?: AdminMongoAdapter
	private adminCredentials?: AdminCredentials

	constructor(options: NebulaOptions) {
		const {
			connection,
			uri,
			mongooseOptions,
			admin,
			adminAuth,
			errorHandler,
			enableDeviceAuthOnAllRoutes,
			...config
		} = options

		if (!connection && !uri) {
			throw new Error('Either a MongoDB connection or URI must be provided.')
		}

		if (admin && adminAuth) {
			throw new Error('Provide either admin credentials or adminAuth middleware, but not both.')
		}

		this.ownsConnection = !connection
		this.connection = connection ?? createConnection(uri!, mongooseOptions)

		const storage = new MongooseAdapter(this.connection)

		this.core = new CoreNebula({
			...config,
			storage,
		})

		let resolvedAdminAuth = adminAuth

		if (!resolvedAdminAuth) {
			this.adminStorage = new AdminMongoAdapter(this.connection)
			this.adminCredentials = admin
			resolvedAdminAuth = createAdminAuthMiddleware(this.adminStorage)
		}

		this.routerInstance = createNebulaRouter(
			this.core,
			resolvedAdminAuth!,
			this.adminStorage,
			errorHandler,
			enableDeviceAuthOnAllRoutes,
		)
	}

	async initialize(): Promise<void> {
		try {
			if (this.ownsConnection) {
				await this.connection.asPromise()
			}

			await this.core.initialize()

			if (this.adminStorage) {
				await this.adminStorage.initialize()

				if (this.adminCredentials) {
					const initializedAdmin = await this.adminStorage.initializeAdmin(this.adminCredentials)
					this.adminCredentials = undefined
				}
			}
		} catch (error) {
			if (this.ownsConnection) {
				await this.connection.close()
			}

			throw error
		}
	}

	async close(): Promise<void> {
		if (this.ownsConnection) {
			await this.connection.close()
		}
	}

	router(): Router {
		return this.routerInstance
	}

	authDevice(): RequestHandler {
		return createAuthDeviceMiddleware((token) => this.core.session.validateSession(token))
	}
}
