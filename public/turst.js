$.post('/polysocket/create', {target_ws: "ws://echo.websocket.org"}).done(function(response) {
  var socket_id = response.socket_id
  $.post('/polysocket/socket', {socket_id: socket_id, data: "Oh hai?"}).done(function() {
    console.log('sent dataz')
  })
  $.get('/polysocket/xhr-poll', {socket_id: socket_id}).done(function(response) {
    console.log('xhr poll res', response)
  })
}).fail(function(err) {
  console.error(err)
})
