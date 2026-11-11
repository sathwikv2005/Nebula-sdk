import { Schema } from 'mongoose'

export const challengeSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			immutable: true,
		},
		deviceId: {
			type: String,
			required: true,
			index: true,
			unique: true,
		},
		applicationId: {
			type: String,
			required: true,
			index: true,
		},
		challengeHash: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		consumedAt: {
			type: Date,
			default: null,
		},
	},
	{
		collection: 'nebula_challenges',
		versionKey: false,
	},
)

challengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
