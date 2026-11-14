import { createHash } from 'node:crypto'
import type { RequestHandler } from 'express'

import type { AdminStorageAdapter } from '../storage/adapter.js'
import { NebulaExpressError } from '../errors/expressError.js'
import { NebulaExpressErrorCode } from '../errors/errorCode.js'

const COOKIE_NAME = 'nebula_admin_session'

export function createAdminAuthMiddleware(storage: AdminStorageAdapter): RequestHandler {
	return async (req, res, next): Promise<void> => {
		try {
			const token = req.cookies?.[COOKIE_NAME]

			if (typeof token !== 'string' || !token) {
				throw new NebulaExpressError(
					'Authentication required.',
					NebulaExpressErrorCode.AUTHENTICATION_REQUIRED,
				)
			}

			const tokenHash = createHash('sha256').update(token).digest('hex')

			const session = await storage.findSessionByTokenHash(tokenHash)

			if (!session) {
				throw new NebulaExpressError(
					'Invalid or expired session.',
					NebulaExpressErrorCode.AUTHENTICATION_REQUIRED,
				)
			}

			const admin = await storage.findAdminById(session.adminId)

			if (!admin || admin.disabledAt) {
				await storage.deleteSession(session.id)

				throw new NebulaExpressError(
					'Admin account is unavailable.',
					NebulaExpressErrorCode.AUTHENTICATION_REQUIRED,
				)
			}
			const { passwordHash: _, ...adminContext } = admin

			req.nebula ??= {}
			req.nebula.admin = adminContext

			next()
		} catch (error) {
			next(error)
		}
	}
}
