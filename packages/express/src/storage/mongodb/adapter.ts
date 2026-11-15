import type { Connection, Model } from 'mongoose'

import type { AdminStorageAdapter } from '../adapter.js'
import { adminSchema, type Admin } from './models/admin.js'
import { adminSessionSchema, type AdminSession } from './models/adminSession.js'
import { AdminCredentials } from '../../types/config.js'
import { hashPassword } from '../../utils/hash.js'
import { randomUUID } from 'node:crypto'

export class AdminMongoAdapter implements AdminStorageAdapter {
	private readonly Admin: Model<Admin>
	private readonly AdminSession: Model<AdminSession>

	constructor(connection: Connection) {
		this.Admin = connection.model<Admin>('Nebula_Admin', adminSchema, 'nebula_admins')

		this.AdminSession = connection.model<AdminSession>(
			'Nebula_Admin_Session',
			adminSessionSchema,
			'nebula_admin_session',
		)
	}

	async initialize(): Promise<void> {
		await Promise.all([this.Admin.createIndexes(), this.AdminSession.createIndexes()])
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

	async initializeAdmin(adminCreds: AdminCredentials): Promise<boolean> {
		const adminCount = await this.Admin.countDocuments()

		if (adminCount > 0) {
			console.info('[Nebula] An admin account already exists. Skipping initial admin creation.')
			return false
		}

		const passwordHash = await hashPassword(adminCreds.password)

		await this.Admin.create({
			id: randomUUID(),
			username: adminCreds.username,
			passwordHash,
		})

		console.info('[Nebula] Initial admin account created successfully.')

		return true
	}
}
