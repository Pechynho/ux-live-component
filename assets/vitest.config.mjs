// [CUSTOM] Standalone vitest config. Upstream merges a shared base config from
// the symfony/ux monorepo root, which does not exist in this fork — this file
// replicates it (see vitest.config.base.mjs in symfony/ux).
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['./test/unit/**/*.{test,spec}.(ts|tsx)'],
        environment: 'jsdom',
        setupFiles: ['./test/setup.js'],
    },
});
