import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // "./" makes every file path in the built site relative, so it works at
  // https://pquitoriano-nb.github.io/AI-hub/ (or any other address) without changes.
  base: "./",
});
