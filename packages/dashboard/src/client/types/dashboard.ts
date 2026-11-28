import type { Application } from './application'
import type { Device } from './device'

export interface DashboardContext {
	applications: Application[]
	devices: Device[]
	loading: boolean
	error: string
}
