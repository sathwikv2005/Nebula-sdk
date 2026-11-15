import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const SALT_LENGTH = 16

export function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(SALT_LENGTH)

	return new Promise((resolve, reject) => {
		scrypt(
			password,
			salt,
			KEY_LENGTH,
			{
				N: 16384,
				r: 8,
				p: 1,
			},
			(error, derivedKey) => {
				if (error) return reject(error)

				resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`)
			},
		)
	})
}

export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltHex, keyHex] = storedHash.split(':')

	if (!saltHex || !keyHex) return Promise.resolve(false)

	const salt = Buffer.from(saltHex, 'hex')
	const storedKey = Buffer.from(keyHex, 'hex')

	if (salt.length !== SALT_LENGTH || storedKey.length !== KEY_LENGTH) {
		return Promise.resolve(false)
	}

	return new Promise((resolve, reject) => {
		scrypt(
			password,
			salt,
			KEY_LENGTH,
			{
				N: 16384,
				r: 8,
				p: 1,
			},
			(error, derivedKey) => {
				if (error) return reject(error)

				resolve(timingSafeEqual(storedKey, derivedKey))
			},
		)
	})
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex')
}

export function generateSessionToken(): string {
	return randomBytes(32).toString('base64url')
}
