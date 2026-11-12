import { NebulaError } from './base.js'
import { NebulaErrorCode } from './errorCode.js'

export class AuthenticationError extends NebulaError {
	constructor(message: string) {
		super(message, NebulaErrorCode.AUTHENTICATION)
	}
}
