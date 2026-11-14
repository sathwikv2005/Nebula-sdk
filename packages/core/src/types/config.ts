import type { StorageAdapter } from '../storage/adapter.js'

export interface NebulaOptions {
	/**
	 * Storage adapter used to persist applications, devices, sessions,
	 * and enrollment data.
	 */
	storage: StorageAdapter

	/**
	 * Secret used for hashing and verifying sensitive authentication data.
	 * Keep this private and use a sufficiently strong random value.
	 */
	secret: string

	/**
	 * Number of characters generated for enrollment codes.
	 * @default 6
	 */
	enrollmentCodeLength?: number

	/**
	 * How long an enrollment code remains valid, in milliseconds.
	 * @default 300_000
	 */
	enrollmentCodeTtlMs?: number

	/**
	 * How long an authentication challenge remains valid, in milliseconds.
	 * @default 60_000
	 */
	challengeTtlMs?: number

	/**
	 * How long an authenticated device session remains valid, in milliseconds.
	 * @default 900_000
	 */
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
