import { randomUUID } from 'node:crypto'
import {
	generateChallenge,
	generateSessionToken,
	hash,
	hashSessionToken,
	verifyHash,
} from '../crypto/hash.js'
import { NebulaError } from '../errors/base.js'
import { Challenge } from '../types/challenge.js'
import { NebulaConfig } from '../types/config.js'
import { verifySignature } from '../crypto/keys.js'
import { Session } from '../types/session.js'

const CHALLENGE_TTL = 60 * 1000

export class AuthenticationError extends NebulaError {
	constructor(message: string) {
		super(message, 'AUTHENTICATION_ERROR')
	}
}

export class AuthenticationService {
	constructor(private readonly config: NebulaConfig) {}

	private async createSession(
		deviceId: string,
		applicationId: string,
		ttl: number,
	): Promise<string> {
		const device = await this.config.storage.getDevice(deviceId)

		if (!device || device.status !== 'active' || device.applicationId !== applicationId) {
			throw new AuthenticationError('Invalid device.')
		}

		if (!Number.isSafeInteger(ttl) || ttl <= 0) {
			throw new AuthenticationError('Invalid session TTL.')
		}

		const token = generateSessionToken()
		const now = Date.now()

		const toSave: Session = {
			id: randomUUID(),
			tokenHash: hashSessionToken(token),
			deviceId,
			applicationId,
			createdAt: now,
			expiresAt: now + ttl,
		}

		await this.config.storage.addSession(toSave)

		return token
	}

	async generateChallenge(deviceId: string): Promise<string> {
		const device = await this.config.storage.getDevice(deviceId)

		if (!device || device.status !== 'active') {
			throw new AuthenticationError('Invalid device.')
		}

		const challenge = generateChallenge()
		const challengeHash = hash(challenge, this.config.secret)
		const now = Date.now()

		const toSave: Challenge = {
			id: randomUUID(),
			deviceId: device.id,
			applicationId: device.applicationId,
			challengeHash,
			expiresAt: now + CHALLENGE_TTL,
		}

		await this.config.storage.addChallenge(toSave)

		return challenge
	}

	async verifyChallenge(deviceId: string, challenge: string, signature: string): Promise<void> {
		const device = await this.config.storage.getDevice(deviceId)

		if (!device || device.status !== 'active') {
			throw new AuthenticationError('Invalid device.')
		}

		const storedChallenge = await this.config.storage.getChallenge(deviceId)

		if (!storedChallenge) {
			throw new AuthenticationError('Challenge not found.')
		}

		if (storedChallenge.applicationId !== device.applicationId) {
			throw new AuthenticationError('Invalid challenge.')
		}

		if (!verifyHash(challenge, storedChallenge.challengeHash, this.config.secret)) {
			throw new AuthenticationError('Invalid challenge.')
		}

		const challengeHash = hash(challenge, this.config.secret)

		const consumed = await this.config.storage.consumeChallenge(deviceId, challengeHash, Date.now())

		if (!consumed) {
			throw new AuthenticationError('Challenge expired or already consumed.')
		}

		const validSignature = verifySignature(device.publicKey, challenge, signature)

		if (!validSignature) {
			throw new AuthenticationError('Invalid signature.')
		}

		//TODO: authentication succeeded.
	}
}
