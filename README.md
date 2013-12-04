polysocket
----------

Assumptions:

* WebSockets are awesome
* We should use WebSockets in client-side JavaScript
* We should use WebSockets on the server
* Browsers without WebSockets should be transparently upgraded (use same WebSocket client code and WebSocket server)
* Networks where WebSockets are not the most network-efficient transport should transparently emulate a WebSocket
* Scaling a server should be thinking only about managing long-lived WebSocket connections
* Developer happiness is desired
* Operational happiness is desired
* Cookies are desired

## What

PolySocket is both a WebSocket shim and a ShimmedWebSocket relay server (to produce pure WebSockets).

The client-side JavaScript provides a PolySocket object which strictly implements the WebSocket interface. When WebSockets are available on the browser (and the preferred choice given the network), PolySocket merely wraps WebSocket. Otherwise, when a different transport (e.g. xhr-streaming, json-polling) is required/preferred to emulate a WebSocket, the PolySocket object provides WebSocket functionality via a PolySocketRelay server.

The PolySocketRelay server accepts non-WebSocket duplex streams, and forwards them to a target server translated into a pure WebSocket connection.

## Why

Scaling the hacks of xhr-streaming, json-polling, etc... are difficult to do while also scaling your application. By separating these ShimmedWebSocket hacks to a central location (the PolySocketRelay), it is easier to scale the Relay on its own as needed and the backend WebSocket application on its own as needed.

WebSockets are standard. If the day ever comes that 100% of your customers support WebSockets, then the only code change should be to stop including the PolySocket JavaScript and replace all invokations of `new PolySocket` with `new WebSocket`.

## License

MIT
