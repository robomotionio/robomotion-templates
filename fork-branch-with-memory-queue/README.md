# Fork Branch with Memory Queue

Demonstrates parallel browser automation — 6 browser instances process a shared queue of URLs concurrently, each taking screenshots.

## How It Works

The flow creates a list of 10 e-commerce websites (Amazon, eBay, AliExpress, etc.) and pushes them into a memory queue. A Fork Branch node spawns 6 parallel branches, each opening its own browser. Each branch dequeues the next site, navigates to it, takes a screenshot saved to the home directory, and loops back for another. When the queue is empty, the Dequeue node throws an exception — the Catch node handles it by closing the browser and calling WG Done to signal that the branch is finished. The flow continues only after all 6 branches complete.

This template teaches two key patterns: **parallel execution** with Fork Branch + WG Done, and **shared work distribution** with Memory Queue.

## Prerequisites

- Install the **Robomotion.MemoryQueue** package from the package manager in Flow Designer
