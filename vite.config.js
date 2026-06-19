import { defineConfig } from 'vite';

// Vite config – builds the front‑end assets to the `dist` folder
export default defineConfig({
  root: './static', // source folder for JS/CSS
  build: {
    outDir: '../dist', // output placed next to project root
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './static/js/app.js' // adjust if your entry script has a different name
      }
    }
  }
});
