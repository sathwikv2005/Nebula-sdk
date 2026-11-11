import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto'

export function hash(value: string, secret: string): string {
	return createHmac('sha256', secret).update(value).digest('hex')
}

export function verifyHash(value: string, expectedHash: string, secret: string): boolean {
	const actual = Buffer.from(hash(value, secret), 'hex')
	const expected = Buffer.from(expectedHash, 'hex')

	if (actual.length !== expected.length) {
		return false
	}

	return timingSafeEqual(actual, expected)
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
