# Redis Basics

Redis Basics is the smallest possible working example of the Robomotion Redis package. It opens a connection, writes a key, reads it back, shows the result in a dialog, and closes out — the exact shape that every non-trivial Redis automation eventually grows from.

When you run the flow, it stores the string `"hello redis"` under the key `my_key`, reads the value back, and pops up a Message Box with what Redis returned. If the dialog shows your value, your credentials, networking, and package wiring are all correct.

## What Redis Basics can do

- Authenticate to a Redis server using a Vault credential
- Write a key/value pair
- Read the value back by key
- Display the result in a dialog
- Disconnect cleanly at the end of the flow

## Behind the scenes

The flow uses five Redis nodes from the `Robomotion.Redis` package plus a dialog and the standard Start/Stop trigger. `Connect` opens a session against your Redis server and returns a `client_id`. Every downstream Redis node takes that `client_id` as input, so only one authentication round-trip happens per flow run. `Disconnect` closes the socket at the end.

Keys and values are hard-coded as `Custom` inputs for clarity — in a real automation you would usually build them from upstream data with a Function node or from a Webhook trigger.

## Configuration

Open the **Connect** node and set:

| Field | Description |
|---|---|
| `optCredentials` | A Redis vault item with server, port, password, and database fields |

Open the **Set Key** and **Get Key** nodes and adjust:

| Field | Description | Example |
|---|---|---|
| `inKey` | The key to write/read | `"my_key"` |
| `inValue` | The value to store (Set only) | `"hello redis"` |
| `optTTL` | Optional expiry in seconds (Set only, 0 = no TTL) | `60` |
