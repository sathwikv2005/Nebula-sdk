import { NebulaError } from './base.js'

export class EnrollmentError extends NebulaError {
	constructor(message: string) {
		super(message, 'ENROLLMENT_ERROR')
	}
}
