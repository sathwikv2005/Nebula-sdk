import express, { type RequestHandler, type Router } from 'express'
import { randomBytes, randomUUID } from 'node:crypto'

import { AdminMongoAdapter } from '../storage/mongodb/adapter.js'
import { NebulaExpressError } from '../errors/expressError.js'
import { NebulaExpressErrorCode } from '../errors/errorCode.js'
import { generateSessionToken, hashToken, verifyPassword } from '../utils/hash.js'

const SESSION_COOKIE = 'nebula_admin_session'
const DEFAULT_SESSION_TTL = 24 * 60 * 60 * 1000

export function createAdminRouter(
	adminAuth: RequestHandler,
	adminStorage?: AdminMongoAdapter,
): Router {
	const router = express.Router()

	const cookieOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict' as const,
		path: '/',
	}

	const builtInAuthError = () =>
		new NebulaExpressError(
			'Built-in admin authentication is not enabled. Use your configured authentication middleware.',
			NebulaExpressErrorCode.INTERNAL_SERVER_ERROR,
		)

	// Admin login
	router.post('/login', async (req, res, next) => {
		if (!adminStorage) {
			return next(builtInAuthError())
		}

		try {
			const { username, password } = req.body ?? {}

			if (
				typeof username !== 'string' ||
				typeof password !== 'string' ||
				!username.trim() ||
				!password
			) {
				return next(
					new NebulaExpressError(
						'Username and password are required.',
						NebulaExpressErrorCode.INVALID_REQUEST,
					),
				)
			}

			const admin = await adminStorage.findAdminByUsername(username)

			if (!admin || admin.disabledAt || !(await verifyPassword(password, admin.passwordHash))) {
				return next(
					new NebulaExpressError(
						'Invalid username or password.',
						NebulaExpressErrorCode.AUTHENTICATION_REQUIRED,
					),
				)
			}

			const token = generateSessionToken()
			const expiresAt = new Date(Date.now() + DEFAULT_SESSION_TTL)

			await adminStorage.createSession({
				id: randomUUID(),
				adminId: admin.id,
				tokenHash: hashToken(token),
				expiresAt,
			})

			res.cookie(SESSION_COOKIE, token, {
				...cookieOptions,
				maxAge: DEFAULT_SESSION_TTL,
				expires: expiresAt,
			})

			return res.status(200).json({
				success: true,
				message: 'Successfully authenticated.',
			})
		} catch (error) {
			return next(error)
		}
	})

	// Admin logout
	router.post('/logout', async (req, res, next) => {
		if (!adminStorage) {
			return next(builtInAuthError())
		}

		try {
			const token = req.cookies?.[SESSION_COOKIE]

			if (typeof token === 'string') {
				const session = await adminStorage.findSessionByTokenHash(hashToken(token))

				if (session) {
					await adminStorage.deleteSession(session.id)
				}
			}

			res.clearCookie(SESSION_COOKIE, cookieOptions)

			return res.status(200).json({
				success: true,
				message: 'Successfully logged out.',
			})
		} catch (error) {
			return next(error)
		}
	})

	// Admin-only routes
	router.use(adminAuth)

	return router
}
