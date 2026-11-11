import { Schema } from 'mongoose'

export const sessionSchema = new Schema(
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
		tokenHash: {
			type: String,
			required: true,
			unique: true,
			immutable: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
		createdAt: {
			type: Date,
			required: true,
			immutable: true,
		},
	},
	{
		collection: 'nebula_session',
		versionKey: false,
	},
)

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
