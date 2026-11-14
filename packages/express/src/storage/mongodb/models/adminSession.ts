import { Schema } from 'mongoose'

export interface AdminSession {
	id: string
	adminId: string
	tokenHash: string
	expiresAt: Date
	createdAt: Date
	updatedAt: Date
}

export const adminSessionSchema = new Schema<AdminSession>(
	{
		id: {
			type: String,
			required: true,
			unique: true,
			default: () => crypto.randomUUID(),
		},
		adminId: {
			type: String,
			required: true,
			index: true,
		},
		tokenHash: {
			type: String,
			required: true,
			unique: true,
			select: false,
		},
		expiresAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
)

adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
