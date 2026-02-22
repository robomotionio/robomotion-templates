# Handle Errors

Demonstrates the throw/catch error handling pattern with input validation and a retry loop.

## How It Works

The flow asks the user to enter a number greater than 100. A Function node validates the input — if it's not a number, it throws `"InvalidType"`; if it's not greater than 100, it throws `"InvalidNumber"`. A Catch node picks up the error, a Switch routes it by error type to show the right error message, then a GoTo loops back to the input dialog for another attempt. Valid input shows a success dialog and stops the flow.

This template teaches three patterns: **throwing custom errors**, **catching and routing by error type**, and **retry loops** with GoTo.

No configuration needed — just run the flow.
