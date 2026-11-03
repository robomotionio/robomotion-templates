import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  Dialog,
  EmptyState,
  Field,
  Form,
  Progress,
  Row,
  Screen,
  Select,
  Stack,
  TextInput,
  useToast,
  type FormValues,
} from "@robomotion/app-kit";
import { useConnection } from "@robomotion/apps-runtime/react";
import { navigate } from "../lib/router";
import {
  RunSuiteParamsSchema,
  useGetRun,
  useListRuns,
  useListSuites,
  useRemoveRun,
  useRunSuite,
} from "../generated/actions.gen";
import type { Run, StepResult } from "../generated/actions.gen";
import { SAMPLE_RUNS, SAMPLE_SUITES } from "../lib/sample";
import { formatWhen } from "../lib/format";

export function RunsPage() {
  const { state } = useConnection();
  const runs = useListRuns();
  const suites = useListSuites();
  const runSuite = useRunSuite();
  const removeRun = useRemoveRun();
  const getRun = useGetRun();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [removing, setRemoving] = useState<Run | null>(null);
  const [looking, setLooking] = useState<Run | null>(null);
  const [values, setValues] = useState<FormValues>({ suite_id: "", build: "" });

  useEffect(() => {
    void suites.run({ filter: "", offset: 0, limit: 0, sort: { key: "name", dir: "asc" } });
  }, []);

  useEffect(() => {
    if (runSuite.data) {
      const result = runSuite.data;
      toast({
        title: `Run finished: ${result.passed} passed, ${result.failed} failed, ${result.flaky} flaky`,
        variant: result.failed > 0 ? "error" : "success",
      });
      setOpen(false);
    }
  }, [runSuite.data]);

  useEffect(() => {
    if (looking) {
      void getRun.run({ id: looking.id });
    }
  }, [looking?.id]);

  useEffect(() => {
    if (removeRun.data) {
      toast({ title: "Run removed", variant: "success" });
      setRemoving(null);
    }
  }, [removeRun.data]);

  const suiteRows = suites.data?.rows ?? (state === "unconfigured" ? SAMPLE_SUITES : []);
  const runRows = state === "unconfigured" ? SAMPLE_RUNS : undefined;

  return (
    <Screen
      title="Runs"
      description="Every time a suite has been run, newest first."
      icon="play"
      actions={
        <Button variant="primary" icon="play" onClick={() => setOpen(true)}>
          Run a suite
        </Button>
      }
    >
      <Stack gap={6}>
        <DataTable<Run>
          columns={[
            { key: "build", header: "Build", sortable: true },
            { key: "suite_name", header: "Suite", sortable: true },
            {
              key: "started_at",
              header: "When",
              sortable: true,
              align: "right",
              render: (row) => <span className="tabular-nums">{formatWhen(row.started_at)}</span>,
            },
            {
              key: "passed",
              header: "Passed",
              align: "right",
              sortable: true,
              render: (row) => (
                <Badge variant={row.passed > 0 ? "success" : "neutral"}>{row.passed}</Badge>
              ),
            },
            {
              key: "failed",
              header: "Failed",
              align: "right",
              render: (row) => (
                <Badge variant={row.failed > 0 ? "danger" : "neutral"}>{row.failed}</Badge>
              ),
            },
            {
              key: "flaky",
              header: "Flaky",
              align: "right",
              render: (row) => (
                <Badge variant={row.flaky > 0 ? "warning" : "neutral"}>{row.flaky}</Badge>
              ),
            },
            {
              key: "total",
              header: "Tests",
              align: "right",
              render: (row) => <span className="tabular-nums">{row.total}</span>,
            },
            {
              key: "report",
              header: "Report",
              align: "right",
              render: (row) => (
                <Button
                  size="sm"
                  variant="secondary"
                  icon="file-text"
                  onClick={() => navigate(`/report?run=${encodeURIComponent(row.id)}`)}
                >
                  Report
                </Button>
              ),
            },
            {
              key: "note",
              header: "What went wrong",
              render: (row) =>
                row.note ? (
                  <span className="text-xs text-muted-foreground line-clamp-2">{row.note}</span>
                ) : null,
            },
          ]}
          rows={runs.data?.rows ?? runRows}
          source={{ action: runs, pageSize: 25 }}
          rowKey={(row) => row.id}
          rowActions={[
            { label: "Report", onSelect: (row) => navigate(`/report?run=${encodeURIComponent(row.id)}`) },
            { label: "What it did", onSelect: (row) => setLooking(row) },
            { label: "Remove this run", danger: true, onSelect: (row) => setRemoving(row) },
          ]}
          filterable
          exportable
          exportFilename="runs.csv"
          emptyState={
            <EmptyState
              icon="play"
              title="No runs yet"
              description="Press Run a suite and its results land here."
              action={
                <Button variant="primary" icon="play" onClick={() => setOpen(true)}>
                  Run a suite
                </Button>
              }
            />
          }
        />
      </Stack>


      <Dialog
        open={looking !== null}
        onClose={() => setLooking(null)}
        title={looking ? `${looking.suite_name} on ${looking.build}` : "What the run did"}
        description="Every step, what it expected, and what the page said — with a screenshot of each."
        size="lg"
      >
        {getRun.loading && !getRun.data ? (
          <p className="text-sm text-muted-foreground">Reading the steps…</p>
        ) : null}
        {getRun.error ? (
          <Alert variant="error" title="The steps could not be read">
            {getRun.error.message}
          </Alert>
        ) : null}
        <Stack gap={4}>
          {(getRun.data?.steps ?? []).map((step: StepResult) => (
            <div key={step.id} className="rounded-md border border-border p-3">
              <Row justify="between" align="start" gap={3}>
                <div className="text-sm font-medium">
                  {step.case_title} · step {step.position}
                  {step.attempt > 1 ? " (second try)" : ""}
                </div>
                <Badge variant={step.ok ? "success" : "danger"}>
                  {step.ok ? "matched" : "did not match"}
                </Badge>
              </Row>
              {step.action ? (
                <p className="text-sm text-muted-foreground">Did: {step.action}</p>
              ) : null}
              <p className="text-sm">
                Expected: <span className="font-medium">{step.expected || "—"}</span>
              </p>
              <p className="text-xs text-muted-foreground">The page said: {step.said || "—"}</p>
              {step.screenshot ? (
                <p className="text-xs text-muted-foreground">Screenshot: {step.screenshot}</p>
              ) : null}
            </div>
          ))}
          {getRun.data && getRun.data.steps.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This run finished before any step was written down.
            </p>
          ) : null}
        </Stack>
      </Dialog>

      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove this run?"
        description="It comes off the history and out of the build's totals. You cannot undo this."
        confirmLabel="Remove it"
        danger
        action={removeRun}
        params={() => ({ id: removing?.id ?? "" })}
      />

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Run a suite"
        description="The robot walks through every case against the staging address and records what happens."
      >
        {suiteRows.length === 0 ? (
          <Alert variant="warning" title="There is nothing to run yet">
            Add a suite and its test cases on the Suites screen first.
          </Alert>
        ) : (
          <Form action={runSuite} schema={RunSuiteParamsSchema} values={values} onChange={setValues}>
            <Field name="suite_id" label="Which suite" required>
              <Select
                placeholder="Pick a suite"
                options={suiteRows.map((one) => ({
                  value: one.id,
                  label: `${one.name} (${one.case_count} cases)`,
                }))}
              />
            </Field>
            <Field
              name="build"
              label="Which build (optional)"
              help="Leave it empty and the robot reads the build number from the page footer."
            >
              <TextInput />
            </Field>
            {runSuite.loading ? (
              <Progress
                value={runSuite.progress?.percent}
                label={runSuite.progress?.message ?? "Running the suite"}
                showValue
              />
            ) : null}
            <Row justify="end" gap={2}>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={runSuite.loading} icon="play">
                Start the run
              </Button>
            </Row>
          </Form>
        )}
      </Dialog>
    </Screen>
  );
}
