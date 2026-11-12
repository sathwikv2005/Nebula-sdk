import { NebulaErrorCodeType } from './errorCode.js'

export class NebulaError extends Error {
	public readonly code: string

	constructor(message: string, code: NebulaErrorCodeType) {
		super(message)

		this.name = new.target.name
		this.code = code

		Error.captureStackTrace?.(this, new.target)
	}
}
