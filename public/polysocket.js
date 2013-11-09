/*
  Example Usage

    PolySocket shares the exact same interface as the WebSocket API.
    Creating a PolySocket should be identical to creating a WebSocket

  + Potential future configuration style

    var PolySocket = polysocket.create({
      router: "polysocket.com",
      timeout: 30,
      transports: ['websocket', 'xhr-polling']
    })

  + Create a PolySocket

    var ps = new PolySocket('ws://echo.websocket.org')

  + Methods

    - Listening for the connection to open
    ps.onopen = function(e) {
      //Do things!
    }

    - Handle errors
    ps.onerror = function(error) {
      console.log("An error occured: " + error)
    }

    - Listening for messages
    ps.onmessage = function(e) {
      console.log('Message from Server: ' + e.data)
    }

    - Send messages
    ps.send('Why hello there')
*/

var PolySocket = function(ws) {

  // Hard coded for now
  //var relayServer = 'localhost'

  if(!(this instanceof PolySocket))
    return new PolySocket(ws)

  self = this

  self.send = function() { console.error("Not yet connected") }

  if(!$ || !$.ajax) {
    var script = document.body.createElement('script')
    script.type = 'text/javascript'
    script.src = '//cdnjs.cloudflare.com/ajax/libs/zepto/1.0/zepto.min.js'
    document.body.appendChild(script)

    var interval = setInterval(function() {
      if($ && $.ajax) {
        clearInterval(interval)
        connect()
      }
    }, 1000)
  } else {
    connect()
  }

  function connect() {

    function success(data) {
      self.socket_id = data.socket_id

      function poll() {
        $.ajax({
          method: 'GET',
          url: '/polysocket/xhr-poll?socket_id=' + self.socket_id,
          success: function(data) {
            poll()
            data.data.forEach(function(msg) {
              if(self.onmessage)
                self.onmessage(msg)
              else
                console.log(msg)
            })
          }
        })
      }
      poll()

      if(self.onopen)
        return self.onopen()

      var connectInterval = setInterval(function() {
          if(self.onopen) {
            self.onopen()
            clearInterval(connectInterval)
          }
      }, 1000)
    }

    $.ajax({
      url: '/polysocket/create',
      type: 'POST',
      data: {target_ws: ws},
      success: success,
      error: function(err) {
        if(self.onerror)
          return self.onerror(err)
        console.log(err)
      }
    })

    self.send = function(msg) {
      if(!self.socket_id)
        return console.error("PolySocket connection has not been opened yet")

      $.ajax({
        url: '/polysocket/socket',
        data: {data: msg, socket_id: self.socket_id},
        type: 'POST',
        error: self.onerror || console.log
      })
    }
  }
}
