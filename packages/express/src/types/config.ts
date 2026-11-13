import type { Connection, ConnectOptions } from 'mongoose'
import type { ErrorRequestHandler, RequestHandler } from 'express'
import type { Nebula as CoreNebula } from '@nebula-sdk/core'

type CoreOptions = Omit<ConstructorParameters<typeof CoreNebula>[0], 'storage'>

/**
 * Use an existing Mongoose connection.
 * Choose this if your application already manages its database connection.
 */
export interface NebulaConnectionOptions {
	/** Existing Mongoose connection to use for Nebula. */
	connection: Connection

	/** Not supported when using an existing connection. */
	uri?: never

	/** Not supported when using an existing connection. */
	mongooseOptions?: never
}

/**
 * Let Nebula create and manage its own Mongoose connection.
 */
export interface NebulaUriOptions {
	/** MongoDB connection string used by Nebula. */
	uri: string

	/** Not supported when providing a connection URI. */
	connection?: never

	/** Additional options passed to mongoose.connect(). */
	mongooseOptions?: ConnectOptions
}

/**
 * Express-specific configuration for Nebula.
 */
export interface NebulaExpressOptions {
	/**
	 * Middleware used to authenticate requests to Nebula's admin routes.
	 * This is required to protect the dashboard and management endpoints.
	 */
	adminAuth: RequestHandler

	/**
	 * Custom Express error-handling middleware.
	 * Use this to handle errors returned by Nebula's routes.
	 */
	errorHandler?: ErrorRequestHandler

	/**
	 * Automatically require device authentication on all Nebula routes.
	 * Set this to false if you want to apply authentication selectively.
	 * @default false
	 */
	enableDeviceAuthOnAllRoutes?: boolean
}

/**
 * Configuration options for initializing Nebula Express.
 *
 * Provide either an existing Mongoose connection or a MongoDB URI.
 */
export type NebulaOptions = CoreOptions &
	NebulaExpressOptions &
	(NebulaConnectionOptions | NebulaUriOptions)
