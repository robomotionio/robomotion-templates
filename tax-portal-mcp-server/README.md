# Tax Portal MCP Server

Every AI assistant now has a browser, and every one of them stops at the same place: a login with a one-time code. This template is about getting past it, and the thing that gets past it is a robot.

The flow turns an ordinary RPA automation into an **MCP server**. An assistant connects to it, reads three tool descriptions, and calls the one it needs — while the robot behind them signs into a government portal, reads two tables and hands back fields. The assistant is given a bearer token and nothing else: it never sees the tax number, the password or the code, and it could not sign in if you asked it to.

The portal is [frs.robomotion.online](https://frs.robomotion.online), a public Robomotion training system with no API, a three-part login and twelve client companies behind it. Nothing about it is friendly, which is exactly why it is worth automating.

## What Tax Portal MCP Server can do

- Turn any flow into an MCP server on a port, with **Listen HTTP** and nothing else
- Publish several tools from one server, each with its own name, description and parameters
- Run **stateless**, so no session id is issued and any robot running the flow can answer any call
- Refuse an unauthorised request with a **bearer token** from your vault, before it reaches MCP
- Answer a two-factor login from the vault, without the caller ever seeing a secret
- Tell the model a call **failed**, with Tool Out's Is Error, so it says it does not know instead of inventing an answer

## Behind the scenes

**The contract is three panels.** A model never sees the canvas. It sees each Tool In node's name, description and parameter table, and nothing else about the flow reaches it. The three here are deliberately three different shapes: `list_clients` takes no arguments at all, `check_vat_status` takes one required company, and `find_einvoice` adds an optional counterparty. Give the descriptions real care — they are the only reason a model picks one tool over another, and the example inside a parameter description is what tells it what a value looks like.

**Every call starts the same way**, so all three tools wire into one *Sign In* subflow: open the browser, take the credentials out of the vault, type them, answer the code. A Switch then routes on `msg.tool`, which Tool In puts on the message for you.

**One node finds and routes.** *Find The Company* has three outputs: the VAT question, the invoice question, and a company this account holds no mandate for. That third port is the one that matters. It sets `msg.is_error`, Tool Out marks the result as a tool error, and the assistant says it cannot tell you rather than returning something the model will paper over.

**Navigation clicks the portal's own links.** The portal is a single-page app: a full page load makes it re-hydrate its session, the first render is signed out, the route guard bounces, and the page the next node reads has no table on it. Open Link is used exactly once, to reach the login.

Two details in the Function nodes were learned by running this, not reading it. The portal renders its column headings in capitals, so columns are looked up without caring about case. And its amounts read `23,453.54` — comma for thousands — so parsing them the European way multiplies every figure by a hundred.

## Setup Guide

1. **Install the package.** `Robomotion.MCP` 0.6.0 or later, for the Bearer Token, Call Timeout and Stateless options.

2. **Create three vault items.** A **Login** item with the portal's tax number as the username and its password, an **API Key** item holding the one-time code, and a second **API Key** item holding a bearer token of your own choosing (`openssl rand -hex 32` is a good one). Bind the first two inside the *Sign In* subflow and the third to *Serve The Tool*.

   The demo logins are printed on the portal's own sign-in page. `FD-990000001 / Training2026! / 550690` is the service account, which is the one a robot should use.

3. **Grant the robot access to the vault.** Admin Console > Robots > your robot > vault access. Without it every Get Item fails.

4. **Run the flow on a robot.** Nothing appears to happen: it has bound the port and is waiting.

5. **Connect an assistant.**

   ```bash
   claude mcp add --transport http frs http://127.0.0.1:8080/mcp \
     --header "Authorization: Bearer <your token>"
   claude mcp list
   ```

6. **Ask it something in English.** "Is Oceanic Imports behind on VAT?" — no tool named, no argument filled in.

## Customization

- **Point it at your own portal.** The URLs live in *Open The Portal* and the two reader subflows; the selectors are `data-testid` XPaths in the Sign In subflow. Everything else is unchanged.
- **Add a tool.** Drop another Tool In on the tools port, give it a name, a description and a parameter table, and add a branch to *Route By Tool*. Nothing else has to change.
- **The one-time code.** This training portal's code is fixed, so it can live in the vault. A real portal rotates it: generate it with the `Robomotion.2FA` package from the shared secret, the way an authenticator does, or have a chat assistant ask a person for it once.
- **Serve it beyond localhost.** Behind a tunnel or reverse proxy, turn on **Allow Proxy Host** — the transport otherwise refuses a forwarded Host header with a bare 403. Set **Allowed Origins** for browser-based clients.
- **Call Timeout** defaults to 120 seconds because RPA is slow. Every path must reach a Tool Out, or the caller waits that long and gets a timeout naming the tool.

## Requirements

- Robomotion Robot with `Robomotion.MCP` 0.6.0
- A vault the robot can read, with the three items above
- An MCP client. Claude Code is used here; any client that speaks Streamable HTTP will do
