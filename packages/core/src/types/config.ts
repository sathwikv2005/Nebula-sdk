import type { StorageAdapter } from '../storage/adapter.js'

export interface NebulaOptions {
	storage: StorageAdapter
	secret: string
	enrollmentCodeLength?: number
	enrollmentCodeTtlMs?: number
	challengeTtlMs?: number
	sessionTtlMs?: number
}

export interface NebulaConfig {
	storage: StorageAdapter
	secret: string
	enrollmentCodeLength: number
	enrollmentCodeTtlMs: number
	challengeTtlMs: number
	sessionTtlMs: number
}
