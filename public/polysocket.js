/* JSON2 */
if(typeof JSON!=="object"){JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){if(typeof rep[i]==="string"){k=rep[i];v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.prototype.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());

/* PolySocket.js */

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

   - Listening for connection close
    ps.onclose = function() {
      //:(
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

  if(!window.console) {
    window.console = {
      log: function(){},
      error: function(){}
    }
  } else if(!window.console.error) {
    window.console.error = console.log
  }


  // Hard coded for now
  //var relayServer = 'localhost'

  if(!(this instanceof PolySocket))
    return new PolySocket(ws)

  var self = this

  self.send = function() { console.error("Not yet connected") }

  connect()

  function connect() {

    function success(data) {
      self.socket_id = data.socket_id

      function poll() {
        microAjax('/polysocket/xhr-poll?socket_id=' + self.socket_id, null, function(result, status) {
          var data = JSON.parse(result)

          if(status === 400) {
            if(self.onerror)
              return self.onerror(data)
            return console.error(data)
          }

          var isClosed = false
            , count = data.events.length

          for(var i = 0; i < count; ++i) {
            (function(event){
              if(event.event === 'close') {
                isClosed = true
                if(self.onclose)
                  self.onclose()
                else
                  console.log("PolySocket closed")
              } else if (event.event === 'message') {
                if(self.onmessage)
                  self.onmessage({data: event.data})
                else
                  console.log("New message: ", {data: event.data})
              }
            })(data.events[i])
          }
          if(!isClosed)
            poll()

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

    microAjax('/polysocket/create', {target_ws: ws}, function(result, status) {
      var data = JSON.parse(result)
      if(status === 400) {
        if(this.onerror)
          return this.onerror(data)
        console.error(data)
      } else {
        success(data)
      }
    })

    self.send = function(msg) {
      if(!self.socket_id)
        return console.error("PolySocket connection has not been opened yet")

      microAjax('/polysocket/socket', {data: msg, socket_id: self.socket_id}, function(result, status){
        if(status !== 201) {
          if(self.onerror)
            self.onerror(result)
          else
            console.error(result)
        }
      })
    }
  }
}

/*
Copyright (c) 2008 Stefan Lange-Hegermann

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function microAjax(url, body, callbackFunction) {

  if(!(this instanceof microAjax))
    return new microAjax(url, body, callbackFunction)

  if(typeof body === 'function') {
    callbackFunction = body;
    body = '';
  }

  this.bindFunction = function (caller, object) {
    return function() {
      return caller.apply(object, [object]);
    };
  };

  this.stateChange = function (object) {
    if (this.request.readyState==4)
      this.callbackFunction(this.request.responseText, this.request.status);
  };

  this.getRequest = function() {
    if (window.ActiveXObject)
      return new ActiveXObject('Microsoft.XMLHTTP');
    else if (window.XMLHttpRequest)
      return new XMLHttpRequest();
    return false;
  };

  this.postBody = body;

  this.callbackFunction=callbackFunction;
  this.url=url;
  this.request = this.getRequest();

  if(this.request) {
    var req = this.request;
    req.onreadystatechange = this.bindFunction(this.stateChange, this);

    if (this.postBody!=="") {
      req.open("POST", url, true);
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    } else {
      req.open("GET", url, true);
    }

    req.send(JSON.stringify(this.postBody));
  }
}

