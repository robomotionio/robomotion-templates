---
name: testing-flow
description: Write and run behavioral tests for Robomotion flows using @robomotion/sdk/testing. Provides FlowTester, MockRegistry, and SubflowTester APIs. Use /validating-flow for schema validation.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(bun:*)
argument-hint: [flow-path]
---

# /testing-flow

Run behavioral tests for a Robomotion flow.

## Purpose

This skill runs `*.test.ts` files using the `@robomotion/sdk/testing` framework:
- Execute tests with `bun test`
- Help write tests for flows
- Provide feedback on test failures

**For schema validation, use `/validating-flow` instead.**

---

## Workflow

### Step 1: Check for Test Files

```bash
ls /path/to/flow/*.test.ts
```

### Step 2: Run Tests

```bash
cd /path/to/flow
bun test
```

### Step 3: Fix Failures and Re-run

If tests fail, fix the issues and run again.

---

## Writing Flow Tests

Use `@robomotion/sdk/testing` to write behavioral tests.

### Quick Start

Create a `main.test.ts` file next to your `main.ts`:

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { FlowTester, MockRegistry } from '@robomotion/sdk/testing';

describe('My Flow', () => {
  let tester: FlowTester;

  beforeAll(async () => {
    tester = await FlowTester.load('./main.ts');
  });

  afterAll(() => {
    MockRegistry.clear();
  });

  test('validates successfully', () => {
    const result = tester.validate();
    expect(result.valid).toBe(true);
  });

  test('has correct node count', () => {
    expect(tester.getNodes().length).toBe(10);
  });
});
```

---

## FlowTester API

### Loading Flows

```typescript
import { FlowTester } from '@robomotion/sdk/testing';

// Load from file path
const tester = await FlowTester.load('./main.ts');

// Load from directory (looks for main.ts)
const tester = await FlowTester.load('./flows/my-flow');

// Create from existing FlowBuilder
const tester = FlowTester.fromBuilder(flowApi.getBuilder());
```

### Structural Inspection

```typescript
// Get all nodes
const nodes = tester.getNodes();
// Returns: Array<{ id, type, name, props, inputs, outputs }>

// Get specific node (supports both '42ec21' and 'main_42ec21')
const node = tester.getNode('42ec21');

// Get all edges
const edges = tester.getEdges();
// Returns: Array<{ from, fromPort, to, toPort }>

// Get flow metadata
const { id, name } = tester.getMetadata();

// Get the underlying FlowBuilder
const builder = tester.getBuilder();
```

### Validation

```typescript
const result = tester.validate();

if (result.valid) {
  console.log('Flow is valid!');
} else {
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);
}
```

### Finding Flow Patterns

```typescript
// Find entry points (trigger nodes)
const entries = tester.findEntryPoints();

// Find termination points (Stop/Error nodes)
const exits = tester.findTerminationPoints();

// Find loops (ForEach with Goto->Label)
const loops = tester.findLoops();
loops.forEach(loop => {
  console.log(`ForEach: ${loop.forEachNodeId}`);
  console.log(`Has Goto->Label: ${loop.hasGotoLabel}`);
  console.log(`Body nodes: ${loop.bodyNodes.join(', ')}`);
});
```

### Path Analysis

```typescript
// Get all possible paths through the flow
const paths = tester.getAllPaths();

// Check all branches terminate properly
const allTerminate = tester.allBranchesTerminate();

// Analyze branch coverage
const coverage = tester.analyzeBranchCoverage();
console.log(`Total branches: ${coverage.totalBranches}`);
console.log(`Coverage: ${coverage.percentage}%`);
console.log(`Uncovered:`, coverage.uncoveredBranches);
```

### Checkpoint Testing

Run flow until a specific node:

```typescript
const result = await tester.runUntil('7dbafc', {
  input: { value: 42 }
});

console.log('Message at checkpoint:', result.msg);
console.log('Path taken:', result.path);
console.log('Error:', result.error);

// Run from one node to another
const segment = await tester.runFromTo('a06926', 'b3d715', {
  input: { data: 'test' }
});
```

### Execution Tracing

```typescript
const result = await tester.runWithTrace({
  input: { items: [1, 2, 3] }
});

// See every step
result.trace.forEach(step => {
  console.log(`Node: ${step.id} (${step.type})`);
  console.log(`Input: ${JSON.stringify(step.input)}`);
  console.log(`Output: ${JSON.stringify(step.output)}`);
});

// Trace path based on input values
const trace = await tester.tracePath({ value: 20 });
console.log('Nodes visited:', trace.nodes);
console.log('Terminates:', trace.terminates);
```

---

## MockRegistry

Mock external services for isolated testing. Supports **two levels of mocking**:

1. **Node ID mocks** (highest priority) - Mock specific nodes by ID
2. **Type mocks** (catch-all) - Mock all nodes of a type

Node ID mocks **always take precedence** over type mocks.

### Why Two Levels?

A flow might have multiple nodes of the same type:
```
c8f412:  Core.Net.HttpRequest -> needs { posts: [...] }
d9e523:  Core.Net.HttpRequest -> needs { user: {...} }
e4a634:  Core.Net.HttpRequest -> needs { postId: '123' }
```

With node ID mocking, you can control each one independently.

### Node ID Mocking (Recommended)

```typescript
import { MockRegistry } from '@robomotion/sdk/testing';

// Mock specific nodes by their ID
MockRegistry.registerNode('c8f412', async (props, msg) => ({
  posts: [
    { title: 'Reddit Post 1', body: 'Content 1' },
    { title: 'Reddit Post 2', body: 'Content 2' },
  ]
}));

MockRegistry.registerNode('f5b745', async (props, msg) => ({
  postId: '12345',
  url: 'https://example.com/post-12345'
}));

// Register multiple node mocks at once
MockRegistry.registerNodes({
  '1ae856': async () => ({ data: 'fetched' }),
  '2bf967': async () => ({ transformed: true }),
  '3ca078': async () => ({ saved: true }),
});
```

### Type Mocking (Catch-All)

Use type mocks for nodes without specific ID mocks:

```typescript
// Catch-all for any HttpRequest without a specific mock
MockRegistry.register('Core.Net.HttpRequest', async (props, msg, nodeId) => {
  console.log(`Unmocked HTTP request in node: ${nodeId}`);
  return { statusCode: 200, body: {} };
});

// Register multiple type mocks
MockRegistry.registerMultiple({
  'Core.Net.HttpRequest': async () => ({ statusCode: 200 }),
  'Robomotion.SQLite.Query': async () => ({ rows: [] }),
  'Robomotion.WordPress.CreatePost': async () => ({ postId: 'mock' }),
});
```

### Mock Priority

When a node executes, MockRegistry checks in order:
1. **Exact node ID match** -> `registerNode('4db189', ...)`
2. **Partial node ID match** -> `'main_4db189'` matches `'4db189'`
3. **Type match** -> `register('Core.Net.HttpRequest', ...)`

### Mock Helpers

```typescript
import { mockResponse, mockError, mockSequence, mockConditional } from '@robomotion/sdk/testing';

// Fixed response
MockRegistry.registerNode('1ae856', mockResponse({ data: 'fixed' }));

// Throw error
MockRegistry.registerNode('5ec29a', mockError('Service unavailable'));

// Sequence of responses (different per call)
MockRegistry.registerNode('6fd3ab', mockSequence([
  { page: 1, hasMore: true },
  { page: 2, hasMore: true },
  { page: 3, hasMore: false },
]));

// Conditional response based on input
MockRegistry.registerNode('5ec29a', mockConditional([
  {
    when: (props, msg) => msg.action === 'create',
    then: { id: 'new-123', created: true }
  },
  {
    when: (props, msg) => msg.action === 'delete',
    then: { deleted: true }
  },
], { error: 'Unknown action' })); // default if no match
```

### Tracking Calls

```typescript
MockRegistry.registerNode('1ae856', async () => ({ data: 'test' }));

// ... run flow ...

// Check how many times the mock was called
const count = MockRegistry.getCallCount('1ae856');

// Get all calls with full details
const calls = MockRegistry.getCalls('1ae856');
calls.forEach(call => {
  console.log('Node ID:', call.nodeId);
  console.log('Props:', call.props);
  console.log('Message:', call.msg);
});

// Get last call
const lastCall = MockRegistry.getLastCall('1ae856');
```

### Verifying Mock Inputs

Check what data was passed TO a mocked node:

```typescript
MockRegistry.registerNode('70e4bc', async () => ({ postId: '123' }));

// ... run flow ...

// Verify the WordPress node received correct data
const wpCall = MockRegistry.getLastCall('70e4bc');
expect(wpCall?.msg.title).toBe('Expected Title');
expect(wpCall?.msg.content).toContain('Expected content');
```

### Clearing Mocks

```typescript
// Clear all mocks (both node and type)
MockRegistry.clear();

// Clear only node ID mocks
MockRegistry.clearNodes();

// Clear only type mocks
MockRegistry.clearTypes();

// Clear a specific mock
MockRegistry.clearMock('1ae856');

// Reset call counts but keep handlers
MockRegistry.resetCalls();
```

---

## Function Extraction

Test Function node JavaScript in isolation without running the full flow.

```typescript
import { extractFunc, runFunc, extractAllFuncs } from '@robomotion/sdk/testing';

// Extract single function by node ID
const func = extractFunc(tester, '2bf967');
const output = func({ value: 21 });
expect(output.result).toBe(42);

// Run with detailed result
const result = runFunc(func, { value: 21 });
console.log('Output:', result.output);
console.log('Error:', result.error);
console.log('Execution time:', result.executionTime, 'ms');

// Extract all Function nodes in the flow
const funcs = extractAllFuncs(tester);
funcs.forEach((fn, nodeId) => {
  console.log(`Testing function in ${nodeId}`);
});
```

### Test with Multiple Cases

```typescript
import { testFunctionWithCases } from '@robomotion/sdk/testing';

const func = extractFunc(tester, '81f5cd');
const results = testFunctionWithCases(func, [
  {
    input: { n: 5 },
    expected: { result: 10 },
    description: 'doubles 5'
  },
  {
    input: { n: 0 },
    expected: { result: 0 },
    description: 'handles zero'
  },
  {
    input: { n: -3 },
    expected: (out) => out.result < 0,  // Custom validator
    description: 'negative stays negative'
  },
]);

results.forEach(r => {
  const status = r.passed ? 'PASS' : 'FAIL';
  console.log(`${status} ${r.description}`);
});
```

### Analyze Function Nodes

```typescript
import { analyzeFunctionNode } from '@robomotion/sdk/testing';

const info = analyzeFunctionNode(tester, '42ec21');
console.log('Code:', info.code);
console.log('Output ports:', info.outputs);
console.log('Variables set:', info.variables);
console.log('Uses msg:', info.usesMsg);
console.log('Has return:', info.returnsValue);
```

---

## Path Analysis

Analyze control flow and complexity.

```typescript
import {
  analyzeFlow,
  calculateCyclomaticComplexity,
  findLongestPath,
  findShortestPath,
  findPaths,
  generateDotGraph
} from '@robomotion/sdk/testing';

// Full flow analysis
const analysis = analyzeFlow(tester);
console.log('Nodes:', analysis.nodeCount);
console.log('Edges:', analysis.edgeCount);
console.log('Entry points:', analysis.entryPoints);
console.log('Exit points:', analysis.exitPoints);
console.log('Control flow nodes:', analysis.controlFlowNodes);
console.log('Cycles:', analysis.cycles);
console.log('Dead ends:', analysis.deadEnds);
console.log('Unreachable:', analysis.unreachableNodes);

// Cyclomatic complexity (E - N + 2P)
const complexity = calculateCyclomaticComplexity(tester);
// 1-10: Simple, 11-20: Moderate, 21-50: Complex, 50+: Very high risk

// Find paths matching criteria
const paths = findPaths(tester, {
  mustPassThrough: ['92a6de', '7dbafc'],
  mustAvoid: ['a3b7ef'],
  mustTerminate: true,
  maxLength: 10,
});

// Generate GraphViz DOT for visualization
const dot = generateDotGraph(tester);
// Convert: dot -Tpng flow.dot -o flow.png
```

---

## SubflowTester

Test subflows in isolation.

```typescript
import { SubflowTester, discoverSubflows, loadAllSubflows } from '@robomotion/sdk/testing';

// Load single subflow
const tester = await SubflowTester.load('./subflows/login');

// Get subflow info
const info = tester.getInfo();
console.log('ID:', info.id);
console.log('Name:', info.name);
console.log('Inputs:', info.inputs);
console.log('Outputs:', info.outputs);
console.log('Dependencies:', info.dependencies);

// Validate subflow
const validation = tester.validate();
expect(validation.valid).toBe(true);

// Run with mocks
const result = await tester.run({
  input: { username: 'test', password: 'secret' },
  mocks: {
    'Core.Browser.Open': async () => ({ browserId: 'mock' }),
    'Core.Browser.ClickElement': async () => ({}),
  },
  timeout: 5000,
});

console.log('Success:', result.success);
console.log('Output:', result.output);
console.log('Exit port:', result.exitPort);
```

### Discovering Subflows

```typescript
// Find all subflows in a flow directory
const subflows = await discoverSubflows('./flows/my-flow');
subflows.forEach(sf => {
  console.log(`${sf.id}: ${sf.name} (${sf.nodeCount} nodes)`);
});

// Load all subflows
const testers = await loadAllSubflows('./flows/my-flow');
```

---

## Integration Mode

Support both unit tests (mocked) and integration tests (real services).

### Environment Detection

```typescript
import {
  isIntegrationMode,
  hasCredentials,
  getCredentials,
  shouldSkipSlowTests,
} from '@robomotion/sdk/testing';

// Check if in integration mode (INTEGRATION=1)
if (isIntegrationMode()) {
  // Run against real services
} else {
  // Use mocks
}

// Check for credentials
if (hasCredentials('wordpress')) {
  const creds = getCredentials('wordpress');
  // { WORDPRESS_URL: '...', WORDPRESS_USER: '...', WORDPRESS_PASS: '...' }
}

if (shouldSkipSlowTests()) { /* SKIP_SLOW=1 */ }
```

### Skip Helpers

```typescript
import { skipWithoutCredentials, skipWithoutIntegration, shouldSkip } from '@robomotion/sdk/testing';

// Skip test if credentials missing
const result = skipWithoutCredentials('gemini');
if (shouldSkip(result)) {
  console.log('Skipped:', result.reason);
  return;
}

// Skip test if not in integration mode
const result2 = skipWithoutIntegration();
if (shouldSkip(result2)) {
  return;
}
```

### Test Helper

```typescript
import { createTestHelper } from '@robomotion/sdk/testing';

const helper = createTestHelper('wordpress');
console.log('Is integration:', helper.isIntegration);
console.log('Has credentials:', helper.hasCredentials);

const skipReason = helper.skipReason();
if (skipReason) {
  return; // Skip test
}

// Only runs if integration mode + credentials available
await helper.runIfIntegration(async () => {
  const result = await realWordPressApi.createPost({ title: 'Test' });
});
```

### Running Integration Tests

```bash
# Unit tests only (default)
bun test

# With integration tests
INTEGRATION=1 bun test

# With specific credentials
WORDPRESS_URL=https://mysite.com \
WORDPRESS_USER=admin \
WORDPRESS_PASS=secret \
INTEGRATION=1 \
bun test

# Skip slow tests
SKIP_SLOW=1 bun test
```

### Supported Credential Types

| Type | Environment Variables |
|------|----------------------|
| `wordpress` | WORDPRESS_URL, WORDPRESS_USER, WORDPRESS_PASS |
| `gemini` | GEMINI_API_KEY |
| `openai` | OPENAI_API_KEY |
| `sqlite` | SQLITE_DB_PATH |
| `mysql` | MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB |
| `postgres` | POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASS, POSTGRES_DB |
| `redis` | REDIS_URL |
| `slack` | SLACK_TOKEN |
| `github` | GITHUB_TOKEN |
| `aws` | AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION |

---

## Complete Example

```typescript
// main.test.ts
import { describe, test, expect, beforeAll, afterAll, afterEach } from 'bun:test';
import {
  FlowTester,
  MockRegistry,
  extractFunc,
  isIntegrationMode,
  hasCredentials,
  analyzeFlow,
} from '@robomotion/sdk/testing';

describe('Reddit to WordPress Flow', () => {
  let tester: FlowTester;

  beforeAll(async () => {
    tester = await FlowTester.load('./main.ts');
  });

  afterEach(() => {
    MockRegistry.resetCalls();
  });

  afterAll(() => {
    MockRegistry.clear();
  });

  // ==========================================
  // STRUCTURAL TESTS
  // ==========================================
  describe('Structure', () => {
    test('validates successfully', () => {
      const result = tester.validate();
      expect(result.valid).toBe(true);
    });

    test('has expected node count', () => {
      expect(tester.getNodes().length).toBe(24);
    });

    test('all branches terminate', () => {
      expect(tester.allBranchesTerminate()).toBe(true);
    });

    test('loops have proper Goto->Label', () => {
      const loops = tester.findLoops();
      expect(loops.every(l => l.hasGotoLabel)).toBe(true);
    });

    test('no dead ends', () => {
      const analysis = analyzeFlow(tester);
      expect(analysis.deadEnds).toHaveLength(0);
    });
  });

  // ==========================================
  // FUNCTION NODE TESTS
  // ==========================================
  describe('Transform Logic', () => {
    test('formats Reddit post to WordPress', () => {
      const transform = extractFunc(tester, '2bf967');
      const input = {
        post: { title: 'Test Post', selftext: 'Content', subreddit: 'programming' }
      };
      const output = transform(input);

      expect(output.wpTitle).toContain('Test Post');
      expect(output.wpContent).toBeDefined();
    });

    test('handles empty content', () => {
      const transform = extractFunc(tester, '2bf967');
      const output = transform({ post: { title: 'Title Only', selftext: '' } });
      expect(output.wpTitle).toBe('Title Only');
    });
  });

  // ==========================================
  // MOCKED EXECUTION TESTS
  // ==========================================
  describe('With Mocked Services', () => {
    beforeAll(() => {
      // Mock specific nodes by ID
      MockRegistry.registerNode('c8f412', async () => ({
        posts: [
          { title: 'Mock Post 1', selftext: 'Content 1', score: 100 },
          { title: 'Mock Post 2', selftext: 'Content 2', score: 200 },
        ]
      }));

      MockRegistry.registerNode('b4c8f0', async (props, msg) => ({
        postId: `mock-${Date.now()}`,
        url: `https://example.com/post`
      }));

      // Catch-all for any unmocked HTTP requests
      MockRegistry.register('Core.Net.HttpRequest', async (props, msg, nodeId) => {
        console.warn(`Unmocked HTTP request in ${nodeId}`);
        return { statusCode: 200, body: {} };
      });
    });

    test('fetches Reddit posts', async () => {
      const result = await tester.runUntil('c5d901', {
        input: { subreddit: 'programming', limit: 10 }
      });

      expect(result.msg.posts).toHaveLength(2);
      expect(MockRegistry.getCallCount('c8f412')).toBe(1);
    });

    test('creates WordPress post with correct data', async () => {
      await tester.runWithTrace({
        input: { subreddit: 'programming', postLimit: 1 }
      });

      // Verify WordPress mock was called with correct data
      const wpCall = MockRegistry.getLastCall('b4c8f0');
      expect(wpCall?.msg.wpTitle).toBeDefined();
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================
  describe('Integration Tests', () => {
    test('real WordPress posting', async () => {
      if (!isIntegrationMode() || !hasCredentials('wordpress')) {
        return;
      }

      const result = await tester.runWithTrace({
        input: { subreddit: 'programming', postLimit: 1 },
        useRealServices: true,
      });

      expect(result.output.publishedUrl).toBeDefined();
    });
  });
});
```

---

## Related Skills

- `/validating-flow` - Schema validation (property names, ports, node types)
- `/creating-flow` - Generate TypeScript code
- `/running-flow` - Execute flow on robot

---

## Tips

- Use node ID mocks for precise control over specific nodes
- Use type mocks as catch-all safety net
- Verify mock inputs with `getLastCall()`
- Test edge cases and error handling
- Keep tests fast and focused
- Use `INTEGRATION=1` for real service tests
- Clear mocks in `afterAll()` to avoid test pollution
