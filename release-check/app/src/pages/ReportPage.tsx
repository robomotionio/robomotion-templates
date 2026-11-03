import { useEffect } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chart,
  CopyButton,
  DescriptionList,
  EmptyState,
  ErrorState,
  Grid,
  Icon,
  Image,
  Row,
  Screen,
  Skeleton,
  Stack,
  Stat,
} from "@robomotion/app-kit";
import { useConnection } from "@robomotion/apps-runtime/react";
import { useSearch } from "../lib/router";
import { useGetReport } from "../generated/actions.gen";
import type { ReportFailure } from "../generated/actions.gen";
import { SAMPLE_REPORT } from "../lib/sample";
import { formatWhen } from "../lib/format";
import { downloadText, safeName } from "../lib/download";

/** How many points the pass rate moved, if there is a build before this one. */
function passRateDelta(report: { pass_rate: number; previous_pass_rate?: number }): number | undefined {
  const before = report.previous_pass_rate;
  if (before === undefined || before < 0) {
    return undefined;
  }
  return Math.round((report.pass_rate - before) * 10) / 10;
}

function FailureCard({ failure }: { failure: ReportFailure }) {
  return (
    <Card>
      <CardHeader
        title={failure.case_title}
        icon="circle-alert"
        description={`Step ${failure.position}${failure.attempt && failure.attempt > 1 ? " · failed on a second try" : ""}`}
        actions={<Badge variant="danger" dot>Failed</Badge>}
      />
      <CardBody>
        <Stack gap={4}>
          <DescriptionList
            columns={1}
            items={[
              {
                label: "What to do",
                value: failure.action || "Look at the page",
              },
              {
                label: "Expected",
                value: <span className="font-medium">{failure.expected || "—"}</span>,
              },
              {
                label: "What the page said",
                value: failure.said || "—",
                wide: true,
              },
              ...(failure.url
                ? [{ label: "The page was at", value: failure.url, wide: true }]
                : []),
            ]}
          />

          {failure.screenshot ? (
            <Stack gap={2}>
              <p className="text-sm font-medium">Screenshot of the page at step {failure.position}</p>
              <Image
                file={failure.screenshot}
                alt={`The page as it was when ${failure.case_title} failed`}
                aspect="16:9"
                fit="contain"
                zoomable
              />
              <p className="text-xs text-muted-foreground">
                Click the picture to open it full screen.
              </p>
            </Stack>
          ) : (
            <p className="text-sm text-muted-foreground">
              There is no screenshot for this step.
            </p>
          )}

          <Row gap={2} wrap>
            <CopyButton value={failure.bug_report} toastTitle="Bug report copied">
              Copy bug report
            </CopyButton>
          </Row>
        </Stack>
      </CardBody>
    </Card>
  );
}

export function ReportPage() {
  const { state } = useConnection();
  const search = useSearch();
  // The run to write up lives in the address, so a report can be linked to
  // and reloaded. No id means the newest run.
  const runId = new URLSearchParams(search).get("run") ?? "";
  const report = useGetReport();

  useEffect(() => {
    void report.run({ run_id: runId });
  }, [runId]);

  const loaded = report.data;
  const shown = loaded ?? (state === "unconfigured" ? SAMPLE_REPORT : null);

  const junit = loaded?.junit;

  return (
    <Screen
      title="Report"
      description="One run written up: whether to ship, what changed, and every failure with what it expected and what the page said."
      icon="file-text"
      actions={
        <Row gap={2} wrap>
          <Button
            icon="download"
            variant="secondary"
            disabled={!junit}
            onClick={() => junit && downloadText(`release-check-${safeName(shown?.build ?? "")}.junit.xml`, junit, "application/xml")}
          >
            Download JUnit
          </Button>
        </Row>
      }
    >
      <Stack gap={6}>
        {report.error && !shown ? (
          <ErrorState error={report.error} onRetry={() => void report.run({ run_id: runId })} />
        ) : null}

        {report.loading && !shown ? (
          <Stack gap={4}>
            <Skeleton variant="rect" height={140} />
            <Grid cols={1} mdCols={2} lgCols={4}>
              <Skeleton variant="rect" height={160} />
              <Skeleton variant="rect" height={160} />
              <Skeleton variant="rect" height={160} />
              <Skeleton variant="rect" height={160} />
            </Grid>
          </Stack>
        ) : null}

        {!shown && !report.loading && !report.error ? (
          <EmptyState
            icon="play"
            title="There is no run to report on"
            description="Run a suite from the Runs screen and its report lands here."
          />
        ) : null}

        {shown ? (
          <>
            <Alert
              variant={shown.ship ? "success" : "error"}
              title={shown.ship ? "Ship" : "Hold"}
            >
              {shown.ship
                ? "No test failed on this build. Nothing is holding it back."
                : `${shown.run.failed} ${shown.run.failed === 1 ? "test" : "tests"} failed on this build. Fix those before it ships.`}
            </Alert>

            <Card>
              <CardBody>
                <Stack gap={4}>
                  <Row justify="between" align="start" gap={4} wrap>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Build</p>
                      <p className="text-xl font-semibold">{shown.build}</p>
                    </div>
                    <Row gap={2} wrap>
                      <Badge variant="success" dot>{`${shown.run.passed} passed`}</Badge>
                      <Badge variant="danger" dot>{`${shown.run.failed} failed`}</Badge>
                      <Badge variant="warning" dot>{`${shown.run.flaky} flaky`}</Badge>
                    </Row>
                  </Row>
                  <DescriptionList
                    columns={2}
                    items={[
                      { label: "Suite", value: shown.suite_name },
                      { label: "Staging address", value: shown.base_url || "the suite has been removed" },
                      { label: "Run", value: shown.run.id },
                      { label: "Tested", value: formatWhen(shown.finished_at || shown.run.finished_at) },
                    ]}
                  />
                </Stack>
              </CardBody>
            </Card>

            <Grid cols={1} mdCols={2} lgCols={4}>
              <Card>
                <CardHeader title="Tests" icon="list-checks" description="How the run ended." />
                <CardBody>
                  <Row gap={4} align="center" wrap>
                    <Stat
                      label="Total tests"
                      value={shown.run.total}
                      trend={undefined}
                      card={false}
                    />
                    <div className="min-w-0 flex-1">
                      <Chart
                        kind="donut"
                        title="Tests by result"
                        height={150}
                        legend
                        data={[
                          { label: "Passed", value: shown.run.passed },
                          { label: "Failed", value: shown.run.failed },
                          { label: "Flaky", value: shown.run.flaky },
                        ]}
                      />
                    </div>
                  </Row>
                  <Row gap={2} wrap>
                    <Badge variant="success" dot>{`Passed ${shown.run.passed}`}</Badge>
                    <Badge variant="danger" dot>{`Failed ${shown.run.failed}`}</Badge>
                    <Badge variant="warning" dot>{`Flaky ${shown.run.flaky}`}</Badge>
                  </Row>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Pass rate" icon="trending-up" description="Across the builds tested." />
                <CardBody>
                  <Stat
                    label="This build"
                    value={`${shown.pass_rate}%`}
                    unit={undefined}
                    delta={passRateDelta(shown)}
                    deltaLabel={shown.changes.previous_build ? `points vs ${shown.changes.previous_build}` : undefined}
                    trend={shown.history.map((point) => point.pass_rate)}
                    card={false}
                  />
                  <p className="text-xs text-muted-foreground">
                    Passed and flaky count as passing. The line is every build, oldest first.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardHeader
                  title="What this build changed"
                  icon="git-compare"
                  description={
                    shown.changes.previous_build
                      ? `Compared with ${shown.changes.previous_build}.`
                      : "This is the first build tested, so there is nothing to compare it with."
                  }
                />
                <CardBody>
                  <Stack gap={3}>
                    <div>
                      <Row justify="between" align="center" gap={2}>
                        <span className="text-sm font-medium">New failures</span>
                        <Badge variant="danger">{shown.changes.new_failures.length}</Badge>
                      </Row>
                      {shown.changes.new_failures.map((title) => (
                        <p key={title} className="text-sm text-muted-foreground">{title}</p>
                      ))}
                    </div>
                    <div>
                      <Row justify="between" align="center" gap={2}>
                        <span className="text-sm font-medium">Still failing</span>
                        <Badge variant="warning">{shown.changes.still_failing.length}</Badge>
                      </Row>
                      {shown.changes.still_failing.map((title) => (
                        <p key={title} className="text-sm text-muted-foreground">{title}</p>
                      ))}
                    </div>
                    <div>
                      <Row justify="between" align="center" gap={2}>
                        <span className="text-sm font-medium">Fixed since the last build</span>
                        <Badge variant="success">{shown.changes.fixed.length}</Badge>
                      </Row>
                      {shown.changes.fixed.map((title) => (
                        <p key={title} className="text-sm text-muted-foreground">{title}</p>
                      ))}
                    </div>
                  </Stack>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Build by build" icon="bar-chart-3" description="Passed, failed and flaky on each build." />
                <CardBody>
                  <Chart
                    kind="bar"
                    stacked
                    title="Results on each build"
                    height={170}
                    legend
                    series={[
                      { name: "Passed", points: shown.history.map((point) => ({ x: point.build, y: point.passed })) },
                      { name: "Failed", points: shown.history.map((point) => ({ x: point.build, y: point.failed })) },
                      { name: "Flaky", points: shown.history.map((point) => ({ x: point.build, y: point.flaky })) },
                    ]}
                  />
                </CardBody>
              </Card>
            </Grid>

            <Stack gap={4}>
              <Row justify="between" align="center" gap={3} wrap>
                <h2 className="text-lg font-semibold">
                  {shown.failures.length === 0
                    ? "Nothing failed"
                    : `${shown.failures.length} ${shown.failures.length === 1 ? "failure" : "failures"} to act on`}
                </h2>
                {shown.failures.length > 0 ? (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="image" size={14} />
                    Every failure has the screenshot of the page.
                  </span>
                ) : null}
              </Row>

              {shown.failures.length === 0 ? (
                <EmptyState
                  icon="check-circle"
                  title="Every test passed on this build"
                  description="There is nothing to fix. The screenshots of every step are on the Runs screen."
                />
              ) : (
                <Stack gap={4}>
                  {shown.failures.map((failure) => (
                    <FailureCard key={failure.id || failure.case_title} failure={failure} />
                  ))}
                </Stack>
              )}
            </Stack>
          </>
        ) : null}
      </Stack>
    </Screen>
  );
}
