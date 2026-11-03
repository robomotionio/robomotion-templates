import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createApp } from "@robomotion/apps-runtime";
import { AppProvider } from "@robomotion/apps-runtime/react";
import { AppShell, AssistantWidget } from "@robomotion/app-kit";
import manifest from "../../app.json";
import { CONTRACT_HASH } from "./generated/actions.gen";
import { loadConfig } from "./lib/config";
import { Router, navigate, usePath } from "./lib/router";
import { screens } from "./screens";
import "./index.css";

// The nav lists one item per screen and only appears once there is more than
// one. Items carry the screen path so the frame can mark the open one and
// hand navigation back to the router instead of reloading the page; the icon
// and the group come from the screen table, and the shell draws a sidebar
// for two or more screens unless app.json's theme says otherwise.
const nav =
  screens.length > 1
    ? screens.map((screen) => ({ label: screen.title, path: screen.path, icon: screen.icon, group: screen.group }))
    : undefined;

const theme = (manifest as { theme?: { accent?: string; layout?: "sidebar" | "topbar" } }).theme;

// The app's icon, if it ships one: drop a square picture at src/icon.png (or
// .svg/.webp) and it becomes the tile in the sidebar and the browser tab.
// Globbed rather than imported so an app with no icon still builds; the shell
// falls back to the first letter of the name, which is what every app did
// before this existed.
const logoSrc = Object.values(
  import.meta.glob("./icon.{png,svg,webp}", { eager: true, query: "?url", import: "default" }),
)[0] as string | undefined;

function Frame() {
  const path = usePath();
  return (
    <AppShell
      title={manifest.name}
      logoSrc={logoSrc}
      accent={theme?.accent}
      layout={theme?.layout}
      nav={nav}
      activePath={path}
      onNavigate={navigate}
    >
      <Router screens={screens} />
      {/* The app's assistant: renders only when the robot says there is one. */}
      <AssistantWidget />
    </AppShell>
  );
}

async function start() {
  const config = await loadConfig();
  const app = createApp({ config, contractHash: CONTRACT_HASH });

  document.title = manifest.name;

  // The tab icon. Without this every app shows the browser's blank page glyph.
  if (logoSrc) {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement("link");
    link.rel = "icon";
    link.href = logoSrc;
    document.head.appendChild(link);
  }

  // One root per mount point. Vite's HMR re-runs this module on a change it
  // cannot patch, and a second createRoot on the same element is what React
  // warns about in the preview's console ("already been passed to
  // createRoot()", issue 265). The root is kept across re-runs and released
  // when the module is replaced.
  const el = document.getElementById("root")!;
  const held = globalThis as { __rmRoot?: ReturnType<typeof createRoot> };
  const root = (held.__rmRoot ??= createRoot(el));
  import.meta.hot?.dispose(() => {
    root.unmount();
    held.__rmRoot = undefined;
  });

  root.render(
    <StrictMode>
      <AppProvider app={app}>
        <Frame />
      </AppProvider>
    </StrictMode>,
  );
}

void start();
