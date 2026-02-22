# REST API

Creates a local HTTP server with two endpoints — a starting point for building robots that respond to HTTP requests.

## How It Works

The flow exposes two routes on `http://localhost:9090`:

- **POST /echo** — returns whatever JSON body you send
- **GET /date** — returns the current date and time

Test with:

```bash
curl http://localhost:9090/date
curl -X POST -d '{"name":"john"}' http://localhost:9090/echo
```

No configuration needed — just run the flow.
