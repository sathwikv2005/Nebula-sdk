import type { Connection, Model } from 'mongoose'

import type { AdminStorageAdapter } from '../adapter.js'
import { adminSchema, type Admin } from './models/admin.js'
import { adminSessionSchema, type AdminSession } from './models/adminSession.js'

export class AdminMongoAdapter implements AdminStorageAdapter {
	private readonly Admin: Model<Admin>
	private readonly AdminSession: Model<AdminSession>

	constructor(connection: Connection) {
		this.Admin = connection.model<Admin>('NebulaAdmin', adminSchema)

		this.AdminSession = connection.model<AdminSession>('NebulaAdminSession', adminSessionSchema)
	}

	async createAdmin(admin: Admin): Promise<void> {
		await this.Admin.create(admin)
	}

	async findAdminByUsername(username: string): Promise<Admin | null> {
		return this.Admin.findOne({
			username: username.toLowerCase().trim(),
		})
			.select('+passwordHash')
			.lean<Admin>()
			.exec()
	}

	async findAdminById(id: string): Promise<Admin | null> {
		return this.Admin.findOne({ id }).lean<Admin>().exec()
	}

	async updateAdmin(id: string, updates: Partial<Admin>): Promise<void> {
		await this.Admin.updateOne({ id }, { $set: updates }).exec()
	}

	async deleteAdmin(id: string): Promise<void> {
		await this.Admin.deleteOne({ id }).exec()
		await this.deleteAdminSessions(id)
	}

	async createSession(session: AdminSession): Promise<void> {
		await this.AdminSession.create(session)
	}

	async findSessionByTokenHash(tokenHash: string): Promise<AdminSession | null> {
		return this.AdminSession.findOne({
			tokenHash,
			expiresAt: { $gt: new Date() },
		})
			.select('+tokenHash')
			.lean<AdminSession>()
			.exec()
	}

	async deleteSession(id: string): Promise<void> {
		await this.AdminSession.deleteOne({ id }).exec()
	}

	async deleteAdminSessions(adminId: string): Promise<void> {
		await this.AdminSession.deleteMany({ adminId }).exec()
	}
}
