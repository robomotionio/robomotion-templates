import type { Config } from "tailwindcss";
import { appKitPreset } from "@robomotion/app-kit/tailwind";

export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./archetypes/**/*.{ts,tsx}",
    // App-kit components carry Tailwind class names; scanning the package
    // keeps those classes in the generated stylesheet.
    "./node_modules/@robomotion/app-kit/dist/**/*.{js,mjs}",
  ],
  // "class", not "media". The kit has carried dark styles all along, but
  // "media" meant only the VIEWER'S operating system could ever switch them
  // on - so an app previewed inside a dark Designer still painted white, and
  // nothing on the page could do anything about it. The bootstrap in
  // index.html resolves the class from ?theme, then a remembered choice, then
  // the OS, so following the OS still happens by default; it is just no
  // longer the only thing that can decide.
  darkMode: "class",
  // The kit's preset is where every colour name a screen writes comes from:
  // bg-card, text-muted-foreground, border-border, bg-primary/10. They map
  // onto the kit's tokens, so a screen written with them matches the kit's
  // own components in both themes without naming a hue.
  presets: [appKitPreset],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
