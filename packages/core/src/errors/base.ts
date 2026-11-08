export class NebulaError extends Error {
	public readonly code: string

	constructor(message: string, code: string) {
		super(message)

		this.name = new.target.name
		this.code = code

		Error.captureStackTrace?.(this, new.target)
	}
}
