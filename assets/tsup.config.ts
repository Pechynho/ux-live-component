import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/live_controller.ts', 'src/live.css'],
    outDir: 'dist',
    clean: true,
    external: ['@hotwired/stimulus'],
    format: 'esm',
    platform: 'browser',
    tsconfig: 'tsconfig.json',
    dts: {
        entry: ['src/live_controller.ts'],
    },
    splitting: false,
});
