import { useSyncExternalStore, type ReactNode } from "react";
import type { IconName } from "@robomotion/app-kit";

/**
 * Minimal path routing on the History API, no extra packages.
 *
 * Screens are ordinary paths ("/", "/review"), so a link to a screen is a
 * normal URL that can be shared, bookmarked and reloaded. The app never sits
 * at the origin root - a published app lives under /<app id>/ and a preview
 * under /preview/<instance>/ - so every path here is relative to the app's
 * base, which the serving tier announces with a <base href> in index.html.
 * Reloading a deep link works because the serving tier answers every path
 * under the app with index.html.
 */

export interface ScreenDef {
  /** Matches the screen key in app.json. */
  id: string;
  /** Screen path relative to the app, for example "/" or "/requests". */
  path: string;
  /** Shown in the nav when the app has more than one screen. */
  title: string;
  /** The nav item's icon, a kit icon name ("layout-dashboard", "list", "settings"). */
  icon?: IconName;
  /** Screens with the same group sit under a small heading in the sidebar. */
  group?: string;
  element: ReactNode;
}

/** The app's mount path with a trailing slash: "/", "/<app id>/", "/preview/<instance>/". */
export function appBase(): string {
  let pathname = "/";
  try {
    pathname = new URL(document.baseURI).pathname;
  } catch {
    return "/";
  }
  return pathname.endsWith("/") ? pathname : pathname.slice(0, pathname.lastIndexOf("/") + 1);
}

/** Where the page is, relative to the app base: "/review?id=7". */
function readLocation(): string {
  const base = appBase();
  let path = window.location.pathname;
  if (base !== "/" && path.startsWith(base)) path = path.slice(base.length - 1);
  if (!path.startsWith("/")) path = "/" + path;
  return path + window.location.search;
}

/** pushState fires no event of its own, so navigate() announces itself. */
const NAVIGATE_EVENT = "rm:navigate";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

/** The current screen path, without any query string. */
export function usePath(): string {
  return useSyncExternalStore(subscribe, () => readLocation().split("?")[0]);
}

/** The current query string without its "?", for screens that take an id. */
export function useSearch(): string {
  return useSyncExternalStore(subscribe, () => window.location.search.replace(/^\?/, ""));
}

/** Go to a screen path, optionally with a query: navigate("/review?id=7"). */
export function navigate(path: string, options: { replace?: boolean } = {}): void {
  const href = screenHref(path);
  if (options.replace) window.history.replaceState(null, "", href);
  else window.history.pushState(null, "", href);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** An href for nav items and links that points at a screen path. */
export function screenHref(path: string): string {
  return appBase() + path.replace(/^\//, "");
}

// Links made when this router still used "#/path" land on the real path.
if (typeof window !== "undefined" && window.location.hash.startsWith("#/")) {
  window.history.replaceState(null, "", screenHref(window.location.hash.slice(1)));
}

export function Router({ screens }: { screens: ScreenDef[] }) {
  const path = usePath();
  const active = screens.find((screen) => screen.path === path) ?? screens[0];
  return <>{active?.element ?? null}</>;
}
