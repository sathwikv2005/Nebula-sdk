import type { Device } from '../types/device'

export function formatDate(value?: string | number | Date) {
	if (!value) return 'Never'

	const date = new Date(value)

	if (Number.isNaN(date.getTime())) return 'Unknown'

	return new Intl.DateTimeFormat('en', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(date)
}

export function getDeviceName(device: Device) {
	const info = device.info as Record<string, unknown> | undefined

	return (
		(typeof info?.name === 'string' && info.name) ||
		(typeof info?.model === 'string' && info.model) ||
		'Unknown device'
	)
}
