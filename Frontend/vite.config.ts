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
          target: 'http://localhost:3003',
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
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": ["@radix-ui/react-dialog", "@radix-ui/react-slot", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
            "query-vendor": ["@tanstack/react-query"],
            "supabase-vendor": ["@supabase/supabase-js"],
          },
        },
      },
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
