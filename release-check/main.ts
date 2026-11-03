import { flow, Message, Custom, JS, Global, Flow, Credential, AI } from '@robomotion/sdk';

flow.create('main', 'Release Check', (f) => {
  f.addDependency('Robomotion.Apps', '0.6.0');
  f.addDependency('Robomotion.SQLite', '1.7.1');

  f.node('c30001', 'Core.Flow.Comment', 'Comment', { optText: "#### Release Check\nA QA app for a team testing its own web product before a release. Testers keep **suites** of test cases, each case a few numbered steps in plain English with the text that should be on the page afterwards. The app runs a suite against a staging build and says **Ship** or **Hold**.\n\nEach screen of the app is one subflow: **Suites**, **Runs**, **Releases** and **Report**. *Runs* is the robot that tests: a fresh browser per case, the staging data reset, a plain browser sign in, then the **Browser Act** node does each step while **Jev** picks every click. Code, not the model, checks the expected text.\n\nA failed case runs once more from a clean start. Failed twice is **Failed**; passed the second time is **Flaky**, never Passed. Results live in SQLite, with a screenshot for every step." });

  f.node('c30002', 'Core.Flow.Comment', 'Setup Guide', { optText: "#### 🚀 Setup Guide\n\n**1.** This flow is the backend of a Robomotion App. Create an app, then put `app.json`, `mcp.json` and the `app/` screens from this template into its project, or rebuild them with Build with AI from the README.\n\n**2.** Admin Console > Vaults: add a **Login** item with the QA account of the app you test, and select it in *The QA Login* inside the *Runs* subflow.\n\n**3.** Add an **API Key** item that holds an OpenRouter key, and select it in the **Credentials** property of *Do The Step* in *Runs*.\n\n**4.** Give the app's robot access to that vault. The Browser Act node needs Robomotion 26.11.0 or later.\n\n**5.** Open the app, add a suite with your staging address, import `assets/quillmoth-regression.csv` and press **Run a suite**." });

  f.node('b3ea2a', 'Core.Flow.SubFlow', 'Suites', { optHidePorts: true });
  f.node('5a9f01', 'Core.Flow.SubFlow', 'Runs', { optHidePorts: true });
  f.node('a243e8', 'Core.Flow.SubFlow', 'Releases', { optHidePorts: true });
  f.node('2211ca', 'Core.Flow.SubFlow', 'Report', { optHidePorts: true });

  f.node('d5e061', 'Core.Trigger.Catch', 'Say What Went Wrong', {
    optNodes: { all: true, ids: [], type: 'catch' },
  })
    .then('e7f2a8', 'Robomotion.Apps.RespondError', 'Tell Them The Problem', {
      optRetryable: true,
      inMessage: Message('error.message'),
      continueOnError: true,
    });
}).start();
