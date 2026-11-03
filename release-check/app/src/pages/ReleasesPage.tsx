import {
  Badge,
  DataTable,
  EmptyState,
  Screen,
  Stack,
} from "@robomotion/app-kit";
import { useConnection } from "@robomotion/apps-runtime/react";
import { useListReleases } from "../generated/actions.gen";
import type { Release } from "../generated/actions.gen";
import { SAMPLE_RELEASES } from "../lib/sample";
import { formatWhen } from "../lib/format";

const VERDICT: Record<string, { label: string; variant: "success" | "warning" | "danger" }> = {
  pass: { label: "Ready", variant: "success" },
  mixed: { label: "Mixed", variant: "warning" },
  fail: { label: "Failing", variant: "danger" },
};

export function ReleasesPage() {
  const { state } = useConnection();
  const releases = useListReleases();

  const sampleRows = state === "unconfigured" ? SAMPLE_RELEASES : undefined;

  return (
    <Screen
      title="Releases"
      description="One row per build that has been tested, and where it stands."
      icon="tag"
    >
      <Stack gap={6}>
        <DataTable<Release>
          columns={[
            { key: "build", header: "Build", sortable: true },
            {
              key: "verdict",
              header: "Where it stands",
              render: (row) => {
                const shown = VERDICT[row.verdict ?? "pass"];
                return <Badge variant={shown.variant} dot>{shown.label}</Badge>;
              },
            },
            {
              key: "last_run_at",
              header: "Last run",
              sortable: true,
              align: "right",
              render: (row) => <span className="tabular-nums">{formatWhen(row.last_run_at)}</span>,
            },
            {
              key: "runs",
              header: "Runs",
              align: "right",
              sortable: true,
              render: (row) => <span className="tabular-nums">{row.runs}</span>,
            },
            {
              key: "passed",
              header: "Passed",
              align: "right",
              render: (row) => <span className="tabular-nums">{row.passed}</span>,
            },
            {
              key: "failed",
              header: "Failed",
              align: "right",
              sortable: true,
              render: (row) => (
                <span className="tabular-nums">{row.failed}</span>
              ),
            },
            {
              key: "flaky",
              header: "Flaky",
              align: "right",
              render: (row) => <span className="tabular-nums">{row.flaky}</span>,
            },
          ]}
          rows={releases.data?.rows ?? sampleRows}
          source={{ action: releases, pageSize: 25 }}
          rowKey={(row) => row.build}
          filterable
          filterPlaceholder="Find a build"
          exportable
          exportFilename="releases.csv"
          emptyState={
            <EmptyState
              icon="tag"
              title="No builds tested yet"
              description="Run a suite against a build and it shows up here."
            />
          }
        />
      </Stack>
    </Screen>
  );
}
