import type { Admin } from '../storage/mongodb/models/admin.js'

export type AdminContext = Omit<Admin, 'passwordHash'>
