import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  FileUpload,
  Form,
  Row,
  Screen,
  Separator,
  Skeleton,
  Stack,
  TextArea,
  TextInput,
  useToast,
  type FormValues,
} from "@robomotion/app-kit";
import { useConnection } from "@robomotion/apps-runtime/react";
import {
  ImportCasesParamsSchema,
  SaveSuiteParamsSchema,
  useGetSuite,
  useImportCases,
  useRemoveCase,
  useRemoveSuite,
  useSaveSuite,
} from "../generated/actions.gen";
import type { TestCase } from "../generated/actions.gen";
import { SAMPLE_DETAIL } from "../lib/sample";
import { plural } from "../lib/format";
import { CaseDialog } from "./CaseDialog";

interface SuiteDetailProps {
  suiteId: string;
  onBack: () => void;
}

/** One suite: the address it tests, editable, and every case in it. */
export function SuiteDetailView({ suiteId, onBack }: SuiteDetailProps) {
  const { state } = useConnection();
  const detail = useGetSuite();
  const saveSuite = useSaveSuite();
  const removeSuite = useRemoveSuite();
  const removeCase = useRemoveCase();
  const importCases = useImportCases();
  const { toast } = useToast();

  const [suiteValues, setSuiteValues] = useState<FormValues>({});
  const [caseDialog, setCaseDialog] = useState<{ open: boolean; testCase: TestCase | null }>({
    open: false,
    testCase: null,
  });
  const [removingSuite, setRemovingSuite] = useState(false);
  const [removingCase, setRemovingCase] = useState<TestCase | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    void detail.run({ id: suiteId });
  }, [suiteId]);

  const loaded = detail.data;
  const shown = loaded ?? (state === "unconfigured" ? SAMPLE_DETAIL : null);
  const suite = shown?.suite;

  useEffect(() => {
    if (!suite) {
      return;
    }
    setSuiteValues({ id: suite.id, name: suite.name, base_url: suite.base_url });
  }, [suite?.id, suite?.name, suite?.base_url]);

  useEffect(() => {
    if (saveSuite.data || removeCase.data || importCases.data) {
      void detail.run({ id: suiteId });
    }
  }, [saveSuite.data, removeCase.data, importCases.data]);

  useEffect(() => {
    if (saveSuite.data) {
      toast({ title: "Suite saved", variant: "success" });
    }
  }, [saveSuite.data]);

  useEffect(() => {
    if (removeCase.data) {
      toast({ title: "Test case removed", variant: "success" });
      setRemovingCase(null);
    }
  }, [removeCase.data]);

  useEffect(() => {
    if (importCases.data) {
      toast({ title: importCases.data.message, variant: "success" });
      setImportOpen(false);
    }
  }, [importCases.data]);

  useEffect(() => {
    if (removeSuite.data) {
      toast({ title: "Suite removed", variant: "success" });
      onBack();
    }
  }, [removeSuite.data]);

  const cases = shown?.cases ?? [];

  return (
    <Screen
      title={suite?.name ?? "Suite"}
      description="The staging address it tests, and the cases that run against it."
      icon="list-checks"
      actions={
        <Row gap={2} wrap>
          <Button variant="ghost" icon="arrow-left" onClick={onBack}>
            All suites
          </Button>
          <Button variant="secondary" icon="upload" onClick={() => setImportOpen(true)}>
            Import from CSV
          </Button>
          <Button
            variant="primary"
            icon="plus"
            onClick={() => setCaseDialog({ open: true, testCase: null })}
          >
            Add a case
          </Button>
          <Button variant="danger" icon="trash-2" onClick={() => setRemovingSuite(true)}>
            Remove suite
          </Button>
        </Row>
      }
    >
      <Stack gap={6}>
        {detail.error && !shown ? (
          <ErrorState error={detail.error} onRetry={() => void detail.run({ id: suiteId })} />
        ) : null}

        {!shown ? (
          <Skeleton variant="rect" height={220} />
        ) : (
          <>
            <Card>
              <CardHeader title="Where it runs" description="Change the address and save it." />
              <CardBody>
                <Form
                  action={saveSuite}
                  schema={SaveSuiteParamsSchema}
                  values={suiteValues}
                  onChange={setSuiteValues}
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field name="name" label="Name" required>
                      <TextInput />
                    </Field>
                    <Field
                      name="base_url"
                      label="Staging address"
                      help="The page a run starts on, for example https://staging.quillmoth.test"
                      required
                    >
                      <TextInput type="url" />
                    </Field>
                  </div>
                  <Row justify="end">
                    <Button type="submit" loading={saveSuite.loading}>
                      Save the suite
                    </Button>
                  </Row>
                </Form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Test cases"
                description="Each one runs from the top of the staging page, in order."
                actions={<Badge variant="outline">{plural(cases.length, "case", "cases")}</Badge>}
              />
              <CardBody>
                {cases.length === 0 ? (
                  <EmptyState
                    icon="list-checks"
                    title="No test cases yet"
                    description="Add one by hand, or bring a whole sheet in from a CSV file."
                    action={
                      <Button
                        variant="primary"
                        icon="plus"
                        onClick={() => setCaseDialog({ open: true, testCase: null })}
                      >
                        Add a case
                      </Button>
                    }
                  />
                ) : (
                  <Stack gap={3}>
                    {cases.map((one) => (
                      <div key={one.id} className="rounded-md border border-border p-3">
                        <Row justify="between" align="start" gap={3}>
                          <div className="font-medium">{one.title}</div>
                          <Badge variant="neutral">
                            {plural(one.steps.length, "step", "steps")}
                          </Badge>
                        </Row>
                        <Stack gap={2}>
                          {one.steps.map((step) => (
                            <div key={step.id} className="text-sm">
                              <span className="text-muted-foreground">{step.position}. </span>
                              <span>{step.action || "Look at the page"}</span>
                              {step.expected ? (
                                <div className="text-xs text-muted-foreground">
                                  Then the page should show “{step.expected}”
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </Stack>
                        <Row gap={2}>
                          <Button
                            size="sm"
                            variant="secondary"
                            icon="pencil"
                            onClick={() => setCaseDialog({ open: true, testCase: one })}
                          >
                            Change it
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            icon="trash-2"
                            onClick={() => setRemovingCase(one)}
                          >
                            Remove
                          </Button>
                        </Row>
                      </div>
                    ))}
                  </Stack>
                )}
              </CardBody>
            </Card>
          </>
        )}

        <Dialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          title="Bring cases in from a CSV file"
          description="One row per step. The first row can be the column names."
        >
          <Stack gap={3}>
            <Alert variant="info" title="The columns">
              case, step, action, expected — for example “Pay with a card, 1, click Pay now, Choose how
              to pay”.
            </Alert>
            <Form
              action={importCases}
              schema={ImportCasesParamsSchema}
              initialValues={{ suite_id: suiteId }}
            >
              <Field
                name="csv"
                label="Paste the rows"
                help="The first row can be the column names."
              >
                <TextArea rows={6} />
              </Field>
              <Row justify="end">
                <Button type="submit" loading={importCases.loading}>
                  Bring in the pasted rows
                </Button>
              </Row>
            </Form>
            <Separator label="or" />
            <FileUpload
              action={importCases}
              params={{ suite_id: suiteId, csv: "" }}
              accept=".csv,text/csv"
              label="Choose the CSV file"
              hint="Rows with the same case name become one test case."
            />
            {importCases.error ? (
              <Alert variant="error" title="That file could not be brought in">
                {importCases.error.message}
              </Alert>
            ) : null}
          </Stack>
        </Dialog>

        <CaseDialog
          open={caseDialog.open}
          onClose={() => setCaseDialog({ open: false, testCase: null })}
          suiteId={suiteId}
          testCase={caseDialog.testCase}
        />

        <ConfirmDialog
          open={removingSuite}
          onClose={() => setRemovingSuite(false)}
          title="Remove this suite?"
          description="Its test cases go with it. Runs already recorded stay in the history."
          confirmLabel="Remove it"
          danger
          action={removeSuite}
          params={{ id: suiteId }}
        />

        <ConfirmDialog
          open={removingCase !== null}
          onClose={() => setRemovingCase(null)}
          title="Remove this test case?"
          description="It comes off the suite. You cannot undo this."
          confirmLabel="Remove it"
          danger
          action={removeCase}
          params={() => ({ id: removingCase?.id ?? "" })}
        />
      </Stack>
    </Screen>
  );
}
