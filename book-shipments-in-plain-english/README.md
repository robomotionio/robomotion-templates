# Book Shipments in Plain English

Book Shipments in Plain English books a morning's orders on a carrier website that has no API. Six orders come in as a CSV, each with a consignee, a destination, a reference, a weight and a note from the customer about how soon they need it. Normally a person types them in one at a time and reads every note to choose the service. Here the robot does it from six numbered steps written in plain English.

## Watch the video

👉 [Watch on YouTube](https://www.youtube.com/watch?v=L21FH2jl3Mk)

The instructions live in one node, *The Runbook*, and nothing else lives there: enter the consignee, choose the destination, enter the reference, choose the service from what the customer wrote, enter the weight, create the shipment. The **Browser Act** node follows them page by page. It reads what is on the screen, and **Jev**, TypeSafe's decision model, picks every next move through OpenRouter: which field, which option, when to go on, when it is done. Not one step names a button, a field or a page, so a redesigned form does not break the flow.

Jev does not write text. It is given the page and a list of allowed answers and returns one of them with a probability for every option, so it cannot invent an answer and every move carries a number the robot can act on. That is also why it is cheap: output tokens cost nothing, and a decision pays for its input alone. In our runs a whole six-order batch took 55 decisions and cost $0.0086 on OpenRouter's own meter.

## What Book Shipments in Plain English can do

- Drive a real website from a numbered runbook in plain English, with no selectors anywhere in the flow
- Choose each order's shipping service from the customer's own words: Standard when they are in no hurry, Express for this week, TurboSlug when something has stopped until the part arrives
- Type logins and order values without ever showing them to the model: it chooses a *label*, and the robot types the value
- Stop and mark an order as stuck when a decision falls below a confidence of 0.55, instead of guessing
- Prove every booking in code, from the page itself, before it counts
- Write a booked sheet with a service, a tracking number and a result for every order

## Behind the scenes

The flow reads a login from the vault and today's orders from `~/Orders/orders.csv`, opens Chrome on the carrier, and a first **Act** node signs in with a one-line goal: *Sign in to the business portal.* Its **Values** are two labels, `the sign-in email` and `the sign-in password`. Only the labels reach the model; the robot substitutes the values when it types. When it is done, *Start the Orders* jumps to the order loop. If it cannot sign in, the node fails with the reason, *If Sign In Gets Stuck* catches it, and *Go To Close* goes straight to closing the browser, before a single order is touched.

Then a loop runs over the orders. **Write the Instructions** fills the runbook's `{destination}`, `{note}` and `{consignee}` from the order and sets the values the Act node may type. **Open a Blank Shipment** loads an empty form, so no order ever starts on the previous order's confirmation page. **Book the Order** is the second Act node, given the whole runbook as its goal. On every turn it takes a snapshot of the visible, enabled elements, stamps each one with an index, and asks Jev one question with every head at once: the operation (click, type, select, scroll, wait, done or blocked) and the target for each. The answer is always an index into the table the robot built, and the robot checks it against the page before it touches anything.

The runbook says what finished looks like: *the goal is done when the page shows a shipping label addressed to {consignee}.* That line matters. A done-condition that names this order is what stops the model from declaring an order finished on the page the last one left behind.

Jev saying *done* is still only the model's belief. **Read the Tracking Number** runs in the page and looks for the carrier's tracking number format, and checks that the page names this order's consignee and reference. **Note It Down** counts an order as booked only when all of that holds and the tracking number is new. An order the Act node could not finish fails with the reason; *If an Order Gets Stuck* catches it and it lands in the sheet as exactly that, while the loop goes on to the next order. When the loop ends, **Make the Sheet** builds the table, **Write the Booked Sheet** saves it as `~/Orders/booked.csv`, and **Say What Happened** logs how many orders were booked, in how many decisions and how many seconds of model time.

## Setup Guide

1. **Put the orders in place:** copy `assets/orders.csv` into a folder called `Orders` in your home directory, so the flow finds `~/Orders/orders.csv`. Your own orders need the same columns: Reference, Consignee, Destination, Weight, Note.
2. **Add the carrier login:** Admin Console > Vaults, add a **Login** item and select it in *Get the Carrier Login*. SlugExpress is a training portal, and its demo accounts are printed on its own sign-in page: <https://slugexpress.robomotion.online/portal/login>.
3. **Add an OpenRouter key:** put an OpenRouter API key into a Vault item (type: API Key) and select it in the **Credentials** property of both *Sign In* and *Book the Order*. Their Provider (OpenRouter) and Decision Model (`typesafe/jev-1.13`) are already set.
4. **Give your robot access** to that vault. The Browser Act node needs Robomotion 26.9.3 or later on the robot.
5. **Run the flow.** Chrome opens on the carrier, signs in and books every order in turn. `~/Orders/booked.csv` gets a service, a tracking number and a result for each one, and the log says how many decisions it took.

## Customization

**Change the job by changing a sentence.** Everything the robot does on the website is in *The Runbook*. Add a step, reword one, or change the policy that maps a note to a service, and the next run follows it. Keep each step to one thing and state the policy right where it is used: in testing, a service rule written far from the step that needed it was followed with much lower confidence.

**Say what finished looks like, for this item.** A generic *the shipment is created* lets the model finish on a page left over from the previous order. Name something that only this item's success page shows.

**Tune the gate** in the Act node's **Min Confidence** (0.55 by default). Raise it for work that is expensive to undo; anything below it fails the node without a click, and the Catch takes it from there.

**Give it more steps** in **Max Steps** for a longer form; the run stops with a reason when the budget is spent, rather than looping.

**Point it at another site** by changing the two addresses in *Open the Carrier* and *Open a Blank Shipment*, the goal in *Sign In*, and the runbook. Keep the proof in *Read the Tracking Number* specific to that site: it is the one place the flow knows what a finished booking looks like.

**Use a chat model instead of Jev** by choosing it as the Decision Model. It works, and it can write free text into a field, but it is slower, bills for every token it writes, and its confidence is self-reported rather than calibrated.
