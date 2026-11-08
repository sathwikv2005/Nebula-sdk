import { NebulaError } from './base.js'

export class AuthenticationError extends NebulaError {
	constructor(message: string) {
		super(message, 'AUTHENTICATION_ERROR')
	}
}
