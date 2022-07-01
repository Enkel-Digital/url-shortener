import { defineConfig } from "vite";
import minify from "vite-plugin-minify";

export default defineConfig({
  plugins: [
    // Used to minify the HTML
    // See options: https://www.npmjs.com/package/html-minifier-terser
    minify({}),
  ],
});
