# Fork Branch with Memory Queue

Fork Branch with Memory Queue demonstrates how to run multiple browser instances in parallel, each pulling work from a shared queue. Powered by Robomotion's Fork Branch node and the Memory Queue package, it teaches two essential patterns for building high throughput automations: parallel execution and shared work distribution.

This template launches 6 browser instances that concurrently process a list of 10 websites, taking screenshots of each. It is a practical starting point for any workflow that needs to divide a batch of tasks across multiple workers.

## What Fork Branch with Memory Queue can do

- Create a shared queue of URLs for parallel processing
- Spawn 6 browser instances that run concurrently
- Distribute work automatically so each browser picks up the next available URL
- Take screenshots of each website and save them to your home directory
- Synchronize all branches before the flow completes

## Behind the scenes

The flow builds a list of 10 e-commerce websites and pushes them into a Memory Queue. A Fork Branch node spawns 6 parallel branches, each opening its own browser. Each branch dequeues the next available URL, navigates to it, takes a screenshot, and loops back for another. When the queue is empty, the Dequeue node throws an exception. A Catch node handles it by closing the browser and calling WG Done to signal that the branch is finished. The main flow waits until all 6 branches complete before proceeding.

## Prerequisites

- Install the **Robomotion.MemoryQueue** package from the package manager in Flow Designer
