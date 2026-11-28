export {}

declare global {
	interface Window {
		__NEBULA_CONFIG__: {
			apiRoute: string
			title?: string
			basePath: string
			loginPath: string
			customLogin: boolean
		}
	}
}
