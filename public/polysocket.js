// sample usage of polysocket
var PolySocket = polysocket.create({
  router: "polysocket.com",
  timeout: 30,
  transports: ['websocket', 'xhr-polling']
})
var ps = new PolySocket('ws://echo.websocket.org')

ps.onmessage = function() {}
