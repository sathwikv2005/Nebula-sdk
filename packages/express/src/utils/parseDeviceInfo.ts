import type { DeviceInfo } from '@nebula-sdk/core'

export function parseDeviceInfo(info: unknown): DeviceInfo {
	const data =
		info && typeof info === 'object' && !Array.isArray(info)
			? (info as Record<string, unknown>)
			: {}

	const getString = (key: string, fallback: string): string => {
		const value = data[key]

		if (typeof value !== 'string' || !value.trim()) {
			return fallback
		}

		return value.trim().slice(0, 128)
	}

	return {
		name: getString('name', 'Unknown'),
		platform: getString('platform', 'Unknown'),
		os: getString('os', 'Unknown'),
		osVersion: getString('osVersion', 'Unknown'),
		appVersion: getString('appVersion', 'Not specified'),
	}
}
