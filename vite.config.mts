import { defineConfig } from 'vite';

const nodeBuiltins = ['assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'module', 'net', 'os', 'path', 'punycode', 'process', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'sys', 'timers', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib', 'worker_threads'];

export default defineConfig({
    build: {
        target: 'node24',
        ssr: true,
        lib: {
            entry: './src/index.ts',
            formats: ['cjs'],
            fileName: () => 'index.js',
        },
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            external: [...nodeBuiltins, 'better-sqlite3', '.prisma/client'],
            output: {
                dir: 'dist/src',
                entryFileNames: 'index.js',
            },
        },
        sourcemap: true,
    },
});
