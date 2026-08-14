import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { nitro as nitroV2Plugin } from "nitro/vite";

export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitroV2Plugin({
      config: {
        preset: "vercel",
      },
    }),
    viteReact(),
  ],
});