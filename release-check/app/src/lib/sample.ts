import type { Release, Report, Run, Suite, SuiteDetail } from "../generated/actions.gen";

/** Shown only before the app has ever had a backend ("unconfigured"), the one
 * state whose banner says the screens show sample data. */
export const SAMPLE_SUITES: Suite[] = [
  { id: "sample-checkout", name: "Checkout", base_url: "https://staging.quillmoth.test", case_count: 4, step_count: 11 },
  { id: "sample-invoices", name: "Invoices", base_url: "https://staging.quillmoth.test/invoices", case_count: 3, step_count: 8 },
  { id: "sample-settings", name: "Account settings", base_url: "https://staging.quillmoth.test/settings", case_count: 2, step_count: 5 },
];

export const SAMPLE_DETAIL: SuiteDetail = {
  suite: SAMPLE_SUITES[0],
  cases: [
    {
      id: "sample-case-1",
      suite_id: SAMPLE_SUITES[0].id,
      title: "Pay with a saved card",
      steps: [
        { id: "s1", position: 1, action: "click Pay now", expected: "Choose how to pay" },
        { id: "s2", position: 2, action: "click Visa ending 4242", expected: "Payment confirmed" },
        { id: "s3", position: 3, action: "click Done", expected: "Your invoice" },
      ],
    },
    {
      id: "sample-case-2",
      suite_id: SAMPLE_SUITES[0].id,
      title: "A card is declined",
      steps: [
        { id: "s4", position: 1, action: "click Pay now", expected: "Choose how to pay" },
        { id: "s5", position: 2, action: "click Card ending 0002", expected: "That card was declined" },
      ],
    },
    {
      id: "sample-case-3",
      suite_id: SAMPLE_SUITES[0].id,
      title: "Apply a discount code",
      steps: [
        { id: "s6", position: 1, action: "type SPRING25 into Discount code", expected: "25% off" },
        { id: "s7", position: 2, action: "click Apply", expected: "Discount applied" },
      ],
    },
  ],
};

export const SAMPLE_RUNS: Run[] = [
  { id: "run-1", suite_id: "sample-checkout", suite_name: "Checkout", build: "2026.11.3-rc2", started_at: Date.now() - 1000 * 60 * 42, finished_at: Date.now() - 1000 * 60 * 38, total: 4, passed: 3, failed: 0, flaky: 1, status: "done", note: "A card is declined passed on a second try, after: step 2: I could not find \"That card was declined\" on the page." },
  { id: "run-2", suite_id: "sample-checkout", suite_name: "Checkout", build: "2026.11.3-rc1", started_at: Date.now() - 1000 * 60 * 60 * 26, finished_at: Date.now() - 1000 * 60 * 60 * 25, total: 4, passed: 2, failed: 2, flaky: 0, status: "done", note: "Pay with a saved card - step 2: I could not find \"Payment confirmed\" on the page." },
  { id: "run-3", suite_id: "sample-invoices", suite_name: "Invoices", build: "2026.11.3-rc1", started_at: Date.now() - 1000 * 60 * 60 * 28, finished_at: Date.now() - 1000 * 60 * 60 * 27, total: 3, passed: 3, failed: 0, flaky: 0, status: "done" },
  { id: "run-4", suite_id: "sample-settings", suite_name: "Account settings", build: "2026.11.2", started_at: Date.now() - 1000 * 60 * 60 * 74, finished_at: Date.now() - 1000 * 60 * 60 * 73, total: 2, passed: 2, failed: 0, flaky: 0, status: "done" },
];

export const SAMPLE_RELEASES: Release[] = [
  { build: "2026.11.3-rc2", first_run_at: Date.now() - 1000 * 60 * 60 * 6, last_run_at: Date.now() - 1000 * 60 * 42, runs: 2, passed: 6, failed: 0, flaky: 1, failing_runs: 0, verdict: "pass" },
  { build: "2026.11.3-rc1", first_run_at: Date.now() - 1000 * 60 * 60 * 30, last_run_at: Date.now() - 1000 * 60 * 60 * 25, runs: 3, passed: 5, failed: 2, flaky: 0, failing_runs: 2, verdict: "mixed" },
  { build: "2026.11.2", first_run_at: Date.now() - 1000 * 60 * 60 * 80, last_run_at: Date.now() - 1000 * 60 * 60 * 73, runs: 2, passed: 4, failed: 2, flaky: 0, failing_runs: 2, verdict: "fail" },
];

/** A finished run written up, shown only before the app has a backend. */
export const SAMPLE_REPORT: Report = {
  run: {
    id: "run-1",
    suite_id: "sample-checkout",
    suite_name: "Checkout",
    build: "1.0.0-rc.3",
    started_at: Date.now() - 1000 * 60 * 12,
    finished_at: Date.now() - 1000 * 60 * 9,
    total: 9,
    passed: 8,
    failed: 1,
    flaky: 0,
    status: "done",
  },
  build: "1.0.0-rc.3",
  suite_name: "Checkout",
  base_url: "https://staging.quillmoth.test",
  finished_at: Date.now() - 1000 * 60 * 9,
  ship: false,
  pass_rate: 88.9,
  previous_pass_rate: 100,
  history: [
    { build: "1.0.0-rc.1", run_id: "a", passed: 9, failed: 0, flaky: 0, total: 9, pass_rate: 100, at: Date.now() - 1000 * 60 * 60 * 50 },
    { build: "1.0.0-rc.2", run_id: "b", passed: 8, failed: 1, flaky: 0, total: 9, pass_rate: 88.9, at: Date.now() - 1000 * 60 * 60 * 26 },
    { build: "1.0.0-rc.3", run_id: "c", passed: 8, failed: 1, flaky: 0, total: 9, pass_rate: 88.9, at: Date.now() - 1000 * 60 * 9 },
  ],
  changes: {
    previous_build: "1.0.0-rc.2",
    new_failures: ["Release notes are public"],
    still_failing: [],
    fixed: [],
  },
  failures: [
    {
      id: "sample-failure",
      case_title: "Release notes are public",
      position: 1,
      action: 'Click "Release notes" at the bottom of the page',
      expected: "Quillmoth Billing 1.0.0",
      said: "Login · Password · Forgot your password?",
      url: "https://staging.quillmoth.test/release-notes",
      attempt: 2,
      bug_report:
        "Test: Release notes are public\nBuild: 1.0.0-rc.3\n\nSteps to reproduce:\n1. Click \"Release notes\" at the bottom of the page\n\nExpected: Quillmoth Billing 1.0.0\nFound: Login · Password · Forgot your password?",
    },
  ],
  junit: '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites name="Release Check - 1.0.0-rc.3" tests="9" failures="1" errors="0" time="180">\n</testsuites>',
};
