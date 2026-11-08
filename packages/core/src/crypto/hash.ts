import { createHmac, randomBytes, randomInt } from 'node:crypto'

export function hash(value: string, secret: string): string {
	return createHmac('sha256', secret).update(value).digest('hex')
}

export function generateEnrollmentCode(length: number): string {
	if (!Number.isInteger(length) || length < 6 || length > 12) {
		throw new RangeError('Enrollment code length must be between 6 and 12')
	}

	return randomInt(10 ** (length - 1), 10 ** length).toString()
}

export function generateChallenge(): string {
	return randomBytes(32).toString('base64url')
}
