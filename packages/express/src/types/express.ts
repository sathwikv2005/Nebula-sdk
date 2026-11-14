import type { Device, Application as NebulaApplication } from '@nebula-sdk/core'
import { NebulaExpressSession } from './nebulaExpressSession'
import { AdminContext } from './admin'

declare global {
	namespace Express {
		interface Request {
			nebula?: {
				session?: NebulaExpressSession
				device?: Device
				application?: NebulaApplication
				admin?: AdminContext
			}
		}
	}
}

export {}
