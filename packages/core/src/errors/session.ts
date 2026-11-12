import { NebulaError } from './base.js'
import { NebulaErrorCode } from './errorCode.js'

export class SessionError extends NebulaError {
	constructor(message: string) {
		super(message, NebulaErrorCode.SESSION)
	}
}
