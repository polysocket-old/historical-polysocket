// https://github.com/nko4/website/blob/master/module/README.md#nodejs-knockout-deploy-check-ins
require('nko')('E1pvbS_tnK63AqjI')

var isProduction     = (process.env.NODE_ENV === 'production')
  , express          = require('express')
  , path             = require('path')
  , port             = (isProduction ? 80 : 8000)
  , Q                = require('q')
  , uuid             = require('uuid')
  , WebSocket        = require('ws')
  , XHRPollingSocket = require('./XHRPollingSocket')

var app = express()
var sockets = {} // will I store my sockets here?

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser())
app.use(app.router)
app.use(express.static(path.resolve(__dirname, './public')))

// Enable CORS
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// creates a polysocket-managed socket
// must provide target_ws parameter
// (TODO forward headers)
app.post('/polysocket/create', function(req, res) {
  var deferred  = Q.defer()
    , target_ws = req.body.target_ws
    , ws        = new WebSocket(target_ws)

  ws.once('open', function() {
    deferred.resolve()
  })
  ws.once('error', function(err) {
    deferred.reject(err)
  })

  Q.timeout(deferred.promise, 1500).then(function() {
    var socket = new XHRPollingSocket(ws)
    socket.once('close', function() {
      delete sockets[socket.id]
    })
    sockets[socket.id] = socket
    res.json({socket_id: socket.id})
  }).fail(function(err) {
    res.json(400, {error: String(err)})
  })
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
  res.set('cache-control', 'private, max-age=0, no-cache')
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
  res.render('index')
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

