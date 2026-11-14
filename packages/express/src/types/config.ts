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

	/** Additional options passed to createConnection(). */
	mongooseOptions?: ConnectOptions
}

/**
 * Credentials for Nebula's built-in admin authentication.
 */
export interface AdminCredentials {
	username: string
	password: string
}

/**
 * Use Nebula's built-in admin authentication.
 */
export interface BuiltInAdminAuthOptions {
	/** Initial admin account credentials. */
	admin: AdminCredentials

	/** Cannot be provided when using built-in admin authentication. */
	adminAuth?: never
}

/**
 * Use custom middleware for admin authentication.
 */
export interface CustomAdminAuthOptions {
	/** Middleware used to authenticate requests to Nebula's admin routes. */
	adminAuth: RequestHandler

	/** Cannot be provided when using custom admin authentication. */
	admin?: never
}

/**
 * Express-specific configuration for Nebula.
 *
 * Provide either admin credentials for built-in authentication
 * or custom admin authentication middleware.
 */
export type NebulaExpressOptions = (BuiltInAdminAuthOptions | CustomAdminAuthOptions) & {
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
 * Also provide either built-in admin credentials or custom admin middleware.
 */
export type NebulaOptions = CoreOptions &
	NebulaExpressOptions &
	(NebulaConnectionOptions | NebulaUriOptions)
