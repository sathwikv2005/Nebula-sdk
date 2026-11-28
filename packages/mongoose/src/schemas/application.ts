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
		deviceCount: {
			type: Number,
			default: 0,
			min: 0,
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
