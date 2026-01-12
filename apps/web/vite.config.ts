import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger"; // Removed for dynamic import

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  let componentTagger;
  if (mode === 'development') {
    try {
      componentTagger = (await import("lovable-tagger")).componentTagger;
    } catch (e) {
      // safe to ignore in production or if missing
      console.warn("Could not load lovable-tagger", e);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      global: 'globalThis',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip', 'lucide-react'],
            charts: ['recharts'],
            utils: ['date-fns', 'axios', 'zod'],
          },
        },
      },
    },
  };
});
