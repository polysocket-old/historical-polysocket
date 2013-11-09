var events = require('events')
  , util   = require('util')
  , uuid   = require('uuid')

module.exports = XHRPollingSocket

// ws should be open and valid
function XHRPollingSocket(ws) {
  events.EventEmitter.call(this)
  var self       = this
  this.buffer    = []
  this.is_closed = false
  this.id        = uuid.v1()
  this.ws        = ws
  this.ws.once('close', function() {
    console.log('websocket:close')
    self.close()
  })
  this.ws.on('message', function(data) {
    self.send_client(data)
  })
}
util.inherits(XHRPollingSocket, events.EventEmitter)

XHRPollingSocket.prototype.close = function() {
  if (!this.is_closed) {
    this.buffer.push({event: 'close'})
    if (this.client) {
      this.set_client(this.client)
    }
    this.ws.removeAllListeners()
    this.ws.close()
    this.emit('close')
  }
  this.is_closed = true
}

XHRPollingSocket.prototype.send_ws = function(data) {
  this.ws.send(data) 
}

XHRPollingSocket.prototype.send_client = function(data) {
  this.buffer.push({event: 'message', data: data})
  if (this.client) {
    this.set_client(this.client)
  }
}

XHRPollingSocket.prototype.set_client = function(client) {
  if (this.buffer.length) {
    client.json({events: this.buffer})
    this.buffer = []
    this.client = null
  } else {
    this.client = client
  }
}

