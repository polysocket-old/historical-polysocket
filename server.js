// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('E1pvbS_tnK63AqjI')

var isProduction = (process.env.NODE_ENV === 'production')
  , express      = require('express')
  , path         = require('path')
  , port         = (isProduction ? 80 : 8000)
  , Q            = require('q')
  , uuid         = require('uuid')
  , WebSocket    = require('ws')

var app = express()
var sockets = {} // will I store my sockets here?

app.use(express.bodyParser())
app.use(app.router)
app.use(express.static(path.resolve(__dirname, './public')))

function Socket(ws){
  var self    = this
  this.buffer = []
  this.client = null
  this.ws     = ws
  this.ws.then(function(ws) {
    ws.on('message', function(data) {
      console.log('websocket:data', data)
      self.send_client(data)
    })
    ws.once('close', function() {
      console.log('websocket:close')
    })
  })
}

// sets the current response client socket (current xhr poll stream)
// sends any buffered messages immediately
Socket.prototype.set_client = function(client) {
  if (this.buffer.length) {
    client.json({data: this.buffer})
    this.buffer = []
    this.client = null
  } else {
    this.client = client
  }
}

// either uses the current client, or buffers and waits for client
Socket.prototype.send_client = function(data) {
  this.buffer.push(data)
  if (this.client) {
    this.set_client(this.client)
  }
}

// sends data to the connected websocket
Socket.prototype.send_ws = function(data) {
  this.ws.then(function(ws) {
    ws.send(data)
  })
}

// creates a polysocket-managed socket
// must provide target_ws parameter
// (TODO forward headers)
app.post('/polysocket/create', function(req, res) {
  console.log("hi mom")
  var socket_id = uuid.v1()
    , target_ws = req.body.target_ws
    , wsp       = Q.defer()
    , ws

  sockets[socket_id] = new Socket(wsp.promise)
  ws = new WebSocket(target_ws)
  ws.once('open', function() {
    console.log('websocket:open')
    wsp.resolve(ws)
  })
  ws.once('error', function(err) {
    console.error('websocket:error', err)
    wsp.reject(err)
  })
  res.json({socket_id: socket_id})
})

// long-lived polling xhr request, returns when we have data
// must provide valid socket_id parameter
// eventually returns 200 {data: #{data}} on success
// returns 400 {error: "don't call me like that, asshole"} on error
app.get('/polysocket/xhr-poll', function(req, res) {
  var socket_id = req.query.socket_id
  if (!sockets[socket_id]) {
    // bitch, that's a mistake
    return res.json(400, {error: 'bitch, you best get yo\'self a real socket'})
  }
  sockets[socket_id].set_client(res)
})

// short post into an existing socket
// must provide valid socket_id parameter
// must provide data parameter
// returns 201 on success
// returns 400 {error: "what did you call me?"} on error
app.post('/polysocket/socket', function(req, res) {
  var socket_id = req.body.socket_id
    , data      = req.body.data

  if (!sockets[socket_id]) {
    return res.json(400, {error: 'get a real socket, asshole'})
  }
  sockets[socket_id].send_ws(data)
  res.send(201)
})

app.get('/', function (req, res) {
  // http://blog.nodeknockout.com/post/35364532732/protip-add-the-vote-ko-badge-to-your-app
  var voteko = '<iframe src="http://nodeknockout.com/iframe/nodest-colony" frameborder=0 scrolling=no allowtransparency=true width=115 height=25></iframe>are you seeing this!?'

  res.writeHead(200, {'Content-Type': 'text/html'})
  res.end('<html><body>' + voteko + '</body></html>\n')
})

app.listen(port, function(err) {
  if (err) { console.error(err); process.exit(-1) }

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0) {
    require('fs').stat(__filename, function(err, stats) {
      if (err) { return console.error(err) }
      process.setuid(stats.uid)
    })
  }

  console.log('Server running at http://0.0.0.0:' + port + '/')
})

