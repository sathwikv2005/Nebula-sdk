import { Schema } from 'mongoose'

export interface Admin {
	id: string
	username: string
	passwordHash: string
	createdAt: Date
	updatedAt: Date
	disabledAt?: Date | null
}

export const adminSchema = new Schema<Admin>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			default: () => crypto.randomUUID(),
		},
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
		},
		passwordHash: {
			type: String,
			required: true,
			select: false,
		},
		disabledAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
)
