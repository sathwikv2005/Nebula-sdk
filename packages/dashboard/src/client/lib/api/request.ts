const API_ROUTE = window.__NEBULA_CONFIG__.apiRoute

export async function nebulaRequest(
	route: string,
	options: RequestInit = {},
): Promise<Response | null> {
	try {
		const headers = new Headers(options.headers)

		if (options.body && !headers.has('Content-Type')) {
			headers.set('Content-Type', 'application/json')
		}

		const res = await fetch(API_ROUTE + route, {
			...options,
			credentials: 'include',
			headers,
		})

		return res
	} catch (err) {
		console.error('API request failed:', err)
		return null
	}
}
