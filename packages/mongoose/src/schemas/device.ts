import { Schema } from 'mongoose'

export const deviceSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			immutable: true,
		},
		applicationId: {
			type: String,
			required: true,
			index: true,
		},
		publicKey: {
			type: String,
			required: true,
		},
		algorithm: {
			type: String,
			enum: ['Ed25519'],
			required: true,
			default: 'Ed25519',
		},
		info: {
			type: Schema.Types.Mixed,
			default: {},
		},
		status: {
			type: String,
			enum: ['active', 'revoked'],
			default: 'active',
			required: true,
		},
		createdAt: {
			type: Number,
			required: true,
		},
		lastAuthenticatedAt: {
			type: Number,
			default: null,
		},
	},
	{
		collection: 'nebula_devices',
		versionKey: false,
	},
)

deviceSchema.index({ applicationId: 1, publicKey: 1 }, { unique: true })
