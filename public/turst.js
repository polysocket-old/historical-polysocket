$.post('/polysocket/create', {target_ws: "ws://echo.websocket.org"}).done(function(response) {
  var socket_id = response.socket_id
  forever(socket_id)
  setInterval(function() {
    $.post('/polysocket/socket', {socket_id: socket_id, data: "Oh hai?"}).done(function() {
    }).fail(function(err){
      console.error(err)
    })
  }, 3000)
}).fail(function(err) {
  console.error(err)
})

function forever(socket_id) {
  $.get('/polysocket/xhr-poll', {socket_id: socket_id}).done(function(response) {
    console.log('data', response.data)
  }).complete(forever.bind(null, socket_id))
}
