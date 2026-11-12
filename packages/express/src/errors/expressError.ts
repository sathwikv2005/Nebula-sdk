import { NebulaExpressErrorCode } from './errorCode.js'

export class NebulaExpressError extends Error {
	constructor(
		message: string,
		public readonly code: NebulaExpressErrorCode,
	) {
		super(message)
		this.name = this.constructor.name

		Error.captureStackTrace?.(this, this.constructor)
	}
}
