import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Field,
  FieldArray,
  Form,
  Row,
  TextInput,
  useToast,
  type FormValues,
} from "@robomotion/app-kit";
import { useSaveCase } from "../generated/actions.gen";
import { SaveCaseParamsSchema } from "../generated/actions.gen";
import type { TestCase } from "../generated/actions.gen";

interface CaseDialogProps {
  open: boolean;
  onClose: () => void;
  suiteId: string;
  testCase: TestCase | null;
}

/** Adding or changing one test case: a title and a numbered list of steps. */
export function CaseDialog({ open, onClose, suiteId, testCase }: CaseDialogProps) {
  const saveCase = useSaveCase();
  const { toast } = useToast();
  const [values, setValues] = useState<FormValues>({});

  useEffect(() => {
    if (!open) {
      return;
    }
    setValues({
      id: testCase?.id ?? "",
      suite_id: suiteId,
      title: testCase?.title ?? "",
      steps:
        testCase && testCase.steps.length > 0
          ? testCase.steps.map((step) => ({ action: step.action, expected: step.expected }))
          : [{ action: "", expected: "" }],
    });
  }, [open, suiteId, testCase]);

  useEffect(() => {
    if (saveCase.data) {
      toast({ title: testCase ? "Test case saved" : "Test case added", variant: "success" });
      onClose();
    }
  }, [saveCase.data]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={testCase ? "Change this test case" : "Add a test case"}
      description="Each step says what to do, and the text that should be on the page afterwards."
      size="lg"
    >
      <Form action={saveCase} schema={SaveCaseParamsSchema} values={values} onChange={setValues}>
        <Field name="title" label="What this case checks" required>
          <TextInput />
        </Field>
        <FieldArray
          name="steps"
          label="Steps"
          addLabel="Add a step"
          help='Write the action plainly, for example "click Pay now" or "type anna@example.com into Email".'
          newItem={() => ({ action: "", expected: "" })}
        >
          {() => (
            <Row gap={3} align="start">
              <Field name="action" label="What to do" className="flex-1">
                <TextInput />
              </Field>
              <Field name="expected" label="Text to see afterwards" className="flex-1">
                <TextInput />
              </Field>
            </Row>
          )}
        </FieldArray>
        <Row justify="end" gap={2}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saveCase.loading}>
            Save the case
          </Button>
        </Row>
      </Form>
    </Dialog>
  );
}
