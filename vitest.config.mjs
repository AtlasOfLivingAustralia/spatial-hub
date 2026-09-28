import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['src/test/js/**/*.spec.js'],
        setupFiles: ['src/test/js/setup.js']
    }
});
