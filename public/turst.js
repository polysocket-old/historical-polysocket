$.post('/polysocket/create', {target_ws: "ws://echo.websocket.org"}).done(function(response) {
  var socket_id = response.socket_id
  forever(socket_id)
  $('form').on('submit', function() {
    var data = $('input[type="text"]').val()
    $('input[type="text"]').val('')
    $.post('/polysocket/socket', {socket_id: socket_id, data: data})
    return false
  })
}).fail(function(err) {
  console.error(err)
})

function forever(socket_id) {
  $.get('/polysocket/xhr-poll', {socket_id: socket_id}).done(function(response) {
    var data = response.data
    $('textarea').val(data.join('\n') + '\n' + $('textarea').val())
  }).complete(forever.bind(null, socket_id))
}
