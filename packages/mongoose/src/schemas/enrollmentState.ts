import { Schema } from 'mongoose'

export const enrollmentStateSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			default: 'global',
		},
		expiresAt: {
			type: Date,
			default: null,
		},
		enabledAt: {
			type: Number,
			default: null,
		},
		requestId: {
			type: String,
			default: null,
		},
	},
	{
		collection: 'nebula_enrollment_state',
		versionKey: false,
	},
)
