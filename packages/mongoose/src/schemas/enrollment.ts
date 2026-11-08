import { Schema } from 'mongoose'

export const enrollmentSchema = new Schema(
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
		},
		codeHash: {
			type: String,
			required: true,
		},
		publicKey: {
			type: String,
			required: true,
		},
		info: {
			type: Schema.Types.Mixed,
			default: {},
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected', 'expired'],
			default: 'pending',
			required: true,
		},
		createdAt: {
			type: Number,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		collection: 'nebula_enrollments',
		versionKey: false,
	},
)

enrollmentSchema.index({ applicationId: 1, codeHash: 1 }, { unique: true })

enrollmentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
