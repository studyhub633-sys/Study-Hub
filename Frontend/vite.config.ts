import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      host: true,
      port: 5173,
      strictPort: false,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3004',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "./dist",
      emptyOutDir: true,
      cssCodeSplit: true,
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {},
    },
    esbuild: {
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    logLevel: "info",
  };
});
