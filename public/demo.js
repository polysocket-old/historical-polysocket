$(function() {
  var ps = PolySocket('ws://node.remysharp.com:8001')
    , $txt = $('textarea')
    , $connected = $('.connection p.users')
    , $input = $('input[type="text"]')

  ps.onopen = function() {
    $('.status').addClass('label-success').removeClass('label-danger').html('Connected')
    $('form').on('submit', function(e) {
      e.preventDefault()
      var data = $input.val()
      data = '"' + data + '"'
      addMessage('you', data)
      $input.val('')
      ps.send(data)
      return false
    })
  }

  ps.onmessage = function(e) {
    msg = e.data
    msg = msg.replace('>> ', '')
    if((/^\d+$/).test(msg))
      $connected.html('Users Connected: ' + msg)
    else
      addMessage('them', msg)
  }

  ps.onclose = function() {
    $('.status').removeClass('label-success').addClass('label-danger').html('Disconnected')
  }

  function addMessage(who, msg) {
    if(who === 'them')
      $txt.val('Them: ' + msg + '\n' + $txt.val())
    else if(who === 'you')
      $txt.val('You: ' + msg + '\n' + $txt.val())
  }

})
