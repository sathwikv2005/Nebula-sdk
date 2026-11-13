import type { Session } from '@nebula-sdk/core'

declare global {
	namespace Express {
		interface Request {
			nebula?: {
				session: Session
			}
		}
	}
}

export {}
