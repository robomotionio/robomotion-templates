import type { ScreenDef } from "@/lib/router";
import { SuitesPage } from "./pages/SuitesPage";
import { RunsPage } from "./pages/RunsPage";
import { ReleasesPage } from "./pages/ReleasesPage";
import { ReportPage } from "./pages/ReportPage";

/** Route table consumed by src/main.tsx. Paths mirror the screens in app.json;
 * every screen carries an icon, which is what the sidebar draws beside it. */
export const screens: ScreenDef[] = [
  { id: "suites", path: "/", title: "Suites", icon: "list-checks", element: <SuitesPage /> },
  { id: "runs", path: "/runs", title: "Runs", icon: "play", element: <RunsPage /> },
  { id: "releases", path: "/releases", title: "Releases", icon: "tag", element: <ReleasesPage /> },
  { id: "report", path: "/report", title: "Report", icon: "file-text", element: <ReportPage /> },
];
