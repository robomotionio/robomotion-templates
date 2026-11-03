import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import appKit from "@robomotion/app-kit/vite";

// base: "./" is load-bearing. Published apps are served under /<app id>/ and
// every asset URL must resolve relative to the <base href> injected at serve
// time, not the site root.
export default defineConfig({
  base: "./",
  // The app-kit plugin's type comes from whichever Vite the kit itself was
  // built against. In this monorepo that is a second, older Vite copy, so the
  // two Plugin types are structurally the same but nominally different. A
  // generated app installs the published kit and resolves one Vite, where the
  // cast is a no-op.
  plugins: [react(), appKit() as PluginOption],
  resolve: {
    // "@" points at src/ so shared helpers (lib/router, lib/config) resolve
    // the same way from src/ and from archetypes/.
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
});
