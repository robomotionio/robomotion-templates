# REST API

REST API creates a local HTTP server with multiple endpoints, turning your Robomotion robot into a service that responds to incoming HTTP requests. Powered by Robomotion's HTTP server nodes, it provides a ready made foundation for building API driven automations.

Whether you want to trigger robot actions from external systems, expose data through a simple API, or build webhook receivers, this template gives you a working server to start from.

## What REST API can do

- Spin up a local HTTP server on a configurable port
- Handle POST requests that echo back the JSON body you send
- Handle GET requests that return the current date and time
- Serve as a starting point for building webhook receivers and API driven robots

## Behind the scenes

The flow starts an HTTP server on `http://localhost:9090` with two routes. The **POST /echo** endpoint reads the incoming JSON body and returns it as the response, making it easy to test request handling. The **GET /date** endpoint returns the current date and time. You can extend the flow with additional routes and custom logic to build more complex API services.

## Testing the endpoints

```bash
curl http://localhost:9090/date
curl -X POST -d '{"name":"john"}' http://localhost:9090/echo
```
