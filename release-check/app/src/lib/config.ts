/**
 * Runtime configuration.
 *
 * The serving layer already knows which instance it is serving, so it tells the
 * app rather than making it resolve the instance again from the URL. In
 * production `robomotion-apps-web` injects `window.env`; in local dev the
 * app-kit Vite plugin serves the identical shape at `/__rm/config.json`, built
 * from the preview iframe's query parameters, which is how the preview points
 * this app at a draft instance.
 *
 * Both paths are handled by `loadRuntimeConfig` in the runtime package. This
 * module exists only to give app code one import to reach for; it deliberately
 * does not reimplement the loading, because a second implementation is a second
 * thing to keep in sync with the Go struct that emits the object.
 */

import { loadRuntimeConfig, type AppRuntimeConfig } from "@robomotion/apps-runtime";

export type { AppRuntimeConfig };

export function loadConfig(): Promise<AppRuntimeConfig> {
  return loadRuntimeConfig();
}
