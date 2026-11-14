import type { Admin } from './mongodb/models/admin.js'
import type { AdminSession } from './mongodb/models/adminSession.js'

export interface AdminStorageAdapter {
	initialize(): Promise<void>

	// Admin operations
	createAdmin(admin: Admin): Promise<void>
	findAdminByUsername(username: string): Promise<Admin | null>
	findAdminById(id: string): Promise<Admin | null>
	updateAdmin(id: string, updates: Partial<Admin>): Promise<void>
	deleteAdmin(id: string): Promise<void>

	// Admin session operations
	createSession(session: AdminSession): Promise<void>
	findSessionByTokenHash(tokenHash: string): Promise<AdminSession | null>
	deleteSession(id: string): Promise<void>
	deleteAdminSessions(adminId: string): Promise<void>
}
