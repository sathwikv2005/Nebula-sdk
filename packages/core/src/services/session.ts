import { hashSessionToken } from '../crypto/hash.js'
import { NebulaError } from '../errors/base.js'
import { NebulaConfig } from '../types/config.js'
import { Session } from '../types/session.js'

export class SessionError extends NebulaError {
	constructor(message: string) {
		super(message, 'SESSION_ERROR')
	}
}

export class SessionService {
	constructor(private readonly config: NebulaConfig) {}

	async validateSession(token: string): Promise<Session> {
		const tokenHash = hashSessionToken(token)
		const session = await this.config.storage.getSession(tokenHash)

		if (!session || session.expiresAt <= Date.now()) {
			throw new SessionError('Invalid or expired session.')
		}

		const device = await this.config.storage.getDevice(session.deviceId)

		if (!device || device.status !== 'active' || device.applicationId !== session.applicationId) {
			throw new SessionError('Invalid session.')
		}

		return session
	}

	async revokeSession(token: string): Promise<void> {
		const tokenHash = hashSessionToken(token)
		const session = await this.config.storage.getSession(tokenHash)

		if (!session) {
			return
		}

		await this.config.storage.revokeSession(session.id)
	}

	async revokeDeviceSessions(deviceId: string): Promise<number> {
		return this.config.storage.revokeDeviceSessions(deviceId)
	}
}
