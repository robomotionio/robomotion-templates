import { useEffect, useState } from "react";
import {
  Button,
  DataTable,
  Dialog,
  EmptyState,
  Field,
  Form,
  Row,
  Screen,
  Stack,
  TextInput,
  useToast,
  type FormValues,
} from "@robomotion/app-kit";
import { useConnection } from "@robomotion/apps-runtime/react";
import { navigate, useSearch } from "../lib/router";
import {
  SaveSuiteParamsSchema,
  useListSuites,
  useSaveSuite,
} from "../generated/actions.gen";
import type { Suite } from "../generated/actions.gen";
import { SAMPLE_SUITES } from "../lib/sample";
import { SuiteDetailView } from "../components/SuiteDetailView";

export function SuitesPage() {
  const { state } = useConnection();
  const suites = useListSuites();
  const saveSuite = useSaveSuite();
  const { toast } = useToast();

  const search = useSearch();
  // Which suite is open lives in the address bar, so it can be linked to and
  // reloaded, and going back returns to the list.
  const openId = new URLSearchParams(search).get("suite");
  const openSuite = (id: string) => navigate(`/?suite=${encodeURIComponent(id)}`);
  const closeSuite = () => navigate("/");
  const [newOpen, setNewOpen] = useState(false);
  const [values, setValues] = useState<FormValues>({ name: "", base_url: "" });

  useEffect(() => {
    if (saveSuite.data) {
      toast({ title: "Suite added", variant: "success" });
      setNewOpen(false);
      setValues({ name: "", base_url: "" });
    }
  }, [saveSuite.data]);

  if (openId) {
    return <SuiteDetailView suiteId={openId} onBack={closeSuite} />;
  }

  const sampleRows = state === "unconfigured" ? SAMPLE_SUITES : undefined;

  return (
    <Screen
      title="Suites"
      description="The groups of tests your team runs before a build can ship."
      icon="list-checks"
      actions={
        <Button variant="primary" icon="plus" onClick={() => setNewOpen(true)}>
          New suite
        </Button>
      }
    >
      <Stack gap={6}>
        <DataTable<Suite>
          columns={[
            {
              key: "name",
              header: "Suite",
              sortable: true,
              render: (row) => <span className="font-medium">{row.name}</span>,
            },
            {
              key: "base_url",
              header: "Staging address",
              sortable: true,
              render: (row) => <span className="text-muted-foreground">{row.base_url}</span>,
            },
            {
              key: "case_count",
              header: "Cases",
              align: "right",
              sortable: true,
              render: (row) => <span className="tabular-nums">{row.case_count}</span>,
            },
            {
              key: "open",
              header: "Cases and steps",
              align: "right",
              render: (row) => (
                <Button size="sm" variant="secondary" onClick={() => openSuite(row.id)}>
                  Open
                </Button>
              ),
            },
          ]}
          rows={suites.data?.rows ?? sampleRows}
          source={{ action: suites, pageSize: 25 }}
          rowKey={(row) => row.id}
          onRowClick={(row) => openSuite(row.id)}
          filterable
          exportable
          exportFilename="suites.csv"
          emptyState={
            <EmptyState
              icon="list-checks"
              title="No suites yet"
              description="A suite is a set of tests that run against one staging address."
              action={
                <Button variant="primary" icon="plus" onClick={() => setNewOpen(true)}>
                  New suite
                </Button>
              }
            />
          }
        />
      </Stack>

      <Dialog
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="New suite"
        description="Give it a name and the staging address its tests start from."
      >
        <Form action={saveSuite} schema={SaveSuiteParamsSchema} values={values} onChange={setValues}>
          <Field name="name" label="Name" required>
            <TextInput />
          </Field>
          <Field
            name="base_url"
            label="Staging address"
            help="For example https://staging.quillmoth.test"
            required
          >
            <TextInput type="url" />
          </Field>
          <Row justify="end" gap={2}>
            <Button type="button" variant="secondary" onClick={() => setNewOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saveSuite.loading}>
              Add the suite
            </Button>
          </Row>
        </Form>
      </Dialog>
    </Screen>
  );
}
