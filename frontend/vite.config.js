import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Backend API base URL. In Docker the service is named `backend`.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
