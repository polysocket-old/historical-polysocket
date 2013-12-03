$(function() {
  var ps = WebSocket('ws://echo.websocket.org')
    , $txt = $('textarea')

  ps.onopen = function() {
    $('form').on('submit', function() {
      var data = $('input[type="text"]').val()
      ps.send(data)
      return false
    })
  }

  ps.onmessage = function(msg) {
    $txt.val(msg.data + '\n' + $txt.val())
  }

})
