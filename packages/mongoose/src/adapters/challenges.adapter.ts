import type { Challenge } from '@nebula-sdk/core'
import type { createNebulaModels } from '../models.js'

type NebulaModels = ReturnType<typeof createNebulaModels>

export class ChallengesAdapter {
	constructor(private readonly models: NebulaModels) {}

	async getChallenge(deviceId: string): Promise<Challenge | null> {
		return this.models.Challenges.findOne({ deviceId })
			.select({ _id: 0, __v: 0 })
			.lean<Challenge>()
			.exec()
	}

	async addChallenge(challenge: Challenge): Promise<void> {
		await this.models.Challenges.findOneAndReplace({ deviceId: challenge.deviceId }, challenge, {
			upsert: true,
			new: true,
			runValidators: true,
		}).exec()
	}

	async consumeChallenge(
		deviceId: string,
		challengeHash: string,
		now: number,
	): Promise<Challenge | null> {
		return this.models.Challenges.findOneAndUpdate(
			{
				deviceId,
				challengeHash,
				consumedAt: null,
				expiresAt: { $gt: new Date(now) },
			},
			{ $set: { consumedAt: new Date(now) } },
			{ new: false },
		)
			.select({ _id: 0, __v: 0 })
			.lean<Challenge>()
			.exec()
	}

	async deleteChallenge(deviceId: string): Promise<void> {
		await this.models.Challenges.deleteOne({ deviceId }).exec()
	}
}
