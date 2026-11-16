import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/server/index.ts'],
	format: ['esm', 'cjs'],
	dts: true,
	outDir: 'dist/server',
	splitting: false,
})
