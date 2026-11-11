import { Session } from '@nebula-sdk/core'
import type { createNebulaModels } from '../models.js'

type NebulaModels = ReturnType<typeof createNebulaModels>

export class SessionAdapter {
	constructor(private readonly models: NebulaModels) {}

	async addSession(session: Session): Promise<void> {
		await this.models.Session.findOneAndReplace({ deviceId: session.deviceId }, session, {
			upsert: true,
			new: true,
			runValidators: true,
		}).exec()
	}

	async getSession(tokenHash: string): Promise<Session | null> {
		return this.models.Session.findOne({
			tokenHash,
			expiresAt: { $gt: new Date() },
		})
			.select({ _id: 0 })
			.lean<Session>()
			.exec()
	}

	async revokeSession(sessionId: string): Promise<boolean> {
		const result = await this.models.Session.deleteOne({
			id: sessionId,
		}).exec()

		return result.deletedCount > 0
	}

	async revokeDeviceSessions(deviceId: string): Promise<number> {
		const result = await this.models.Session.deleteMany({
			deviceId,
		}).exec()

		return result.deletedCount
	}

	async deleteExpiredSessions(now: Date = new Date()): Promise<number> {
		const result = await this.models.Session.deleteMany({
			expiresAt: { $lte: now },
		}).exec()

		return result.deletedCount
	}
}
