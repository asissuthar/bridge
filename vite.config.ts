import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/bridge.ts"),
      name: "bridge",
      fileName: "bridge",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["uuid"],
      output: {
        globals: {
          uuid: "uuid",
        },
      },
    },
  },
  plugins: [dts()],
});
