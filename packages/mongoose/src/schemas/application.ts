import { Schema } from 'mongoose'

export const applicationSchema = new Schema(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			immutable: true,
		},
		name: {
			type: String,
			required: true,
		},
		enrollmentEnabled: {
			type: Boolean,
			default: true,
		},
		createdAt: {
			type: Number,
			required: true,
		},
		updatedAt: {
			type: Number,
			required: true,
		},
	},
	{
		collection: 'nebula_applications',
		versionKey: false,
	},
)
