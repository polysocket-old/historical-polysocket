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
        microAjax('/polysocket/xhr-poll?socket_id=' + self.socket_id, function(result, status) {
          data = JSON.parse(result)

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
      data = JSON.parse(result)
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

/* JSON3 */
/*! JSON v3.2.5 | http://bestiejs.github.io/json3 | Copyright 2012-2013, Kit Cambridge | http://kit.mit-license.org */
;(function(){var m=!0,w=null;
(function(I){function l(a){if(l[a]!=w)return l[a];var c;if("bug-string-char-index"==a)c="a"!="a"[0];else if("json"==a)c=l("json-stringify")&&l("json-parse");else{var e;if("json-stringify"==a){c=p.stringify;var b="function"==typeof c&&n;if(b){(e=function(){return 1}).toJSON=e;try{b="0"===c(0)&&"0"===c(new Number)&&'""'==c(new String)&&c(o)===s&&c(s)===s&&c()===s&&"1"===c(e)&&"[1]"==c([e])&&"[null]"==c([s])&&"null"==c(w)&&"[null,null,null]"==c([s,o,w])&&'{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}'==c({a:[e,
m,!1,w,"\x00\u0008\n\u000c\r\t"]})&&"1"===c(w,e)&&"[\n 1,\n 2\n]"==c([1,2],w,1)&&'"-271821-04-20T00:00:00.000Z"'==c(new Date(-864E13))&&'"+275760-09-13T00:00:00.000Z"'==c(new Date(864E13))&&'"-000001-01-01T00:00:00.000Z"'==c(new Date(-621987552E5))&&'"1969-12-31T23:59:59.999Z"'==c(new Date(-1))}catch(f){b=!1}}c=b}if("json-parse"==a){c=p.parse;if("function"==typeof c)try{if(0===c("0")&&!c(!1)){e=c('{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}');var j=5==e.a.length&&1===e.a[0];if(j){try{j=!c('"\t"')}catch(d){}if(j)try{j=
1!==c("01")}catch(h){}}}}catch(i){j=!1}c=j}}return l[a]=!!c}var o={}.toString,q,y,s,J=typeof define==="function"&&define.amd,A="object"==typeof JSON&&JSON,p="object"==typeof exports&&exports&&!exports.nodeType&&exports;p&&A?(p.stringify=A.stringify,p.parse=A.parse):p=I.JSON=A||{};var n=new Date(-3509827334573292);try{n=-109252==n.getUTCFullYear()&&0===n.getUTCMonth()&&1===n.getUTCDate()&&10==n.getUTCHours()&&37==n.getUTCMinutes()&&6==n.getUTCSeconds()&&708==n.getUTCMilliseconds()}catch(P){}l["bug-string-char-index"]=
w;l.json=w;l["json-stringify"]=w;l["json-parse"]=w;if(!l("json")){var t=l("bug-string-char-index");if(!n)var u=Math.floor,K=[0,31,59,90,120,151,181,212,243,273,304,334],B=function(a,c){return K[c]+365*(a-1970)+u((a-1969+(c=+(c>1)))/4)-u((a-1901+c)/100)+u((a-1601+c)/400)};if(!(q={}.hasOwnProperty))q=function(a){var c={},e;if((c.__proto__=w,c.__proto__={toString:1},c).toString!=o)q=function(a){var c=this.__proto__,a=a in(this.__proto__=w,this);this.__proto__=c;return a};else{e=c.constructor;q=function(a){var c=
(this.constructor||e).prototype;return a in this&&!(a in c&&this[a]===c[a])}}c=w;return q.call(this,a)};var L={"boolean":1,number:1,string:1,undefined:1};y=function(a,c){var e=0,b,f,j;(b=function(){this.valueOf=0}).prototype.valueOf=0;f=new b;for(j in f)q.call(f,j)&&e++;b=f=w;if(e)y=e==2?function(a,c){var e={},b=o.call(a)=="[object Function]",f;for(f in a)!(b&&f=="prototype")&&!q.call(e,f)&&(e[f]=1)&&q.call(a,f)&&c(f)}:function(a,c){var e=o.call(a)=="[object Function]",b,f;for(b in a)!(e&&b=="prototype")&&
q.call(a,b)&&!(f=b==="constructor")&&c(b);(f||q.call(a,b="constructor"))&&c(b)};else{f=["valueOf","toString","toLocaleString","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"];y=function(a,c){var e=o.call(a)=="[object Function]",b,g;if(g=!e)if(g=typeof a.constructor!="function"){g=typeof a.hasOwnProperty;g=g=="object"?!!a.hasOwnProperty:!L[g]}g=g?a.hasOwnProperty:q;for(b in a)!(e&&b=="prototype")&&g.call(a,b)&&c(b);for(e=f.length;b=f[--e];g.call(a,b)&&c(b));}}return y(a,c)};if(!l("json-stringify")){var M=
{92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"},v=function(a,c){return("000000"+(c||0)).slice(-a)},F=function(a){var c='"',b=0,g=a.length,f=g>10&&t,j;for(f&&(j=a.split(""));b<g;b++){var d=a.charCodeAt(b);switch(d){case 8:case 9:case 10:case 12:case 13:case 34:case 92:c=c+M[d];break;default:if(d<32){c=c+("\\u00"+v(2,d.toString(16)));break}c=c+(f?j[b]:t?a.charAt(b):a[b])}}return c+'"'},D=function(a,c,b,g,f,j,d){var h,i,k,l,n,p,r,t,x,z;try{h=c[a]}catch(A){}if(typeof h=="object"&&h){i=
o.call(h);if(i=="[object Date]"&&!q.call(h,"toJSON"))if(h>-1/0&&h<1/0){if(B){l=u(h/864E5);for(i=u(l/365.2425)+1970-1;B(i+1,0)<=l;i++);for(k=u((l-B(i,0))/30.42);B(i,k+1)<=l;k++);l=1+l-B(i,k);n=(h%864E5+864E5)%864E5;p=u(n/36E5)%24;r=u(n/6E4)%60;t=u(n/1E3)%60;n=n%1E3}else{i=h.getUTCFullYear();k=h.getUTCMonth();l=h.getUTCDate();p=h.getUTCHours();r=h.getUTCMinutes();t=h.getUTCSeconds();n=h.getUTCMilliseconds()}h=(i<=0||i>=1E4?(i<0?"-":"+")+v(6,i<0?-i:i):v(4,i))+"-"+v(2,k+1)+"-"+v(2,l)+"T"+v(2,p)+":"+v(2,
r)+":"+v(2,t)+"."+v(3,n)+"Z"}else h=w;else if(typeof h.toJSON=="function"&&(i!="[object Number]"&&i!="[object String]"&&i!="[object Array]"||q.call(h,"toJSON")))h=h.toJSON(a)}b&&(h=b.call(c,a,h));if(h===w)return"null";i=o.call(h);if(i=="[object Boolean]")return""+h;if(i=="[object Number]")return h>-1/0&&h<1/0?""+h:"null";if(i=="[object String]")return F(""+h);if(typeof h=="object"){for(a=d.length;a--;)if(d[a]===h)throw TypeError();d.push(h);x=[];c=j;j=j+f;if(i=="[object Array]"){k=0;for(a=h.length;k<
a;z||(z=m),k++){i=D(k,h,b,g,f,j,d);x.push(i===s?"null":i)}a=z?f?"[\n"+j+x.join(",\n"+j)+"\n"+c+"]":"["+x.join(",")+"]":"[]"}else{y(g||h,function(a){var c=D(a,h,b,g,f,j,d);c!==s&&x.push(F(a)+":"+(f?" ":"")+c);z||(z=m)});a=z?f?"{\n"+j+x.join(",\n"+j)+"\n"+c+"}":"{"+x.join(",")+"}":"{}"}d.pop();return a}};p.stringify=function(a,c,b){var g,f,j,d;if(typeof c=="function"||typeof c=="object"&&c)if((d=o.call(c))=="[object Function]")f=c;else if(d=="[object Array]"){j={};d=0;for(var h=c.length,i;d<h;i=c[d++],
(o.call(i)=="[object String]"||o.call(i)=="[object Number]")&&(j[i]=1));}if(b)if((d=o.call(b))=="[object Number]"){if((b=b-b%1)>0){g="";for(b>10&&(b=10);g.length<b;g=g+" ");}}else d=="[object String]"&&(g=b.length<=10?b:b.slice(0,10));return D("",(i={},i[""]=a,i),f,j,g,"",[])}}if(!l("json-parse")){var N=String.fromCharCode,O={92:"\\",34:'"',47:"/",98:"\u0008",116:"\t",110:"\n",102:"\u000c",114:"\r"},b,C,k=function(){b=C=w;throw SyntaxError();},r=function(){for(var a=C,c=a.length,e,g,f,j,d;b<c;){d=
a.charCodeAt(b);switch(d){case 9:case 10:case 13:case 32:b++;break;case 123:case 125:case 91:case 93:case 58:case 44:e=t?a.charAt(b):a[b];b++;return e;case 34:e="@";for(b++;b<c;){d=a.charCodeAt(b);if(d<32)k();else if(d==92){d=a.charCodeAt(++b);switch(d){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114:e=e+O[d];b++;break;case 117:g=++b;for(f=b+4;b<f;b++){d=a.charCodeAt(b);d>=48&&d<=57||d>=97&&d<=102||d>=65&&d<=70||k()}e=e+N("0x"+a.slice(g,b));break;default:k()}}else{if(d==34)break;
d=a.charCodeAt(b);for(g=b;d>=32&&d!=92&&d!=34;)d=a.charCodeAt(++b);e=e+a.slice(g,b)}}if(a.charCodeAt(b)==34){b++;return e}k();default:g=b;if(d==45){j=m;d=a.charCodeAt(++b)}if(d>=48&&d<=57){for(d==48&&(d=a.charCodeAt(b+1),d>=48&&d<=57)&&k();b<c&&(d=a.charCodeAt(b),d>=48&&d<=57);b++);if(a.charCodeAt(b)==46){for(f=++b;f<c&&(d=a.charCodeAt(f),d>=48&&d<=57);f++);f==b&&k();b=f}d=a.charCodeAt(b);if(d==101||d==69){d=a.charCodeAt(++b);(d==43||d==45)&&b++;for(f=b;f<c&&(d=a.charCodeAt(f),d>=48&&d<=57);f++);
f==b&&k();b=f}return+a.slice(g,b)}j&&k();if(a.slice(b,b+4)=="true"){b=b+4;return m}if(a.slice(b,b+5)=="false"){b=b+5;return false}if(a.slice(b,b+4)=="null"){b=b+4;return w}k()}}return"$"},E=function(a){var c,b;a=="$"&&k();if(typeof a=="string"){if((t?a.charAt(0):a[0])=="@")return a.slice(1);if(a=="["){for(c=[];;b||(b=m)){a=r();if(a=="]")break;if(b)if(a==","){a=r();a=="]"&&k()}else k();a==","&&k();c.push(E(a))}return c}if(a=="{"){for(c={};;b||(b=m)){a=r();if(a=="}")break;if(b)if(a==","){a=r();a=="}"&&
k()}else k();(a==","||typeof a!="string"||(t?a.charAt(0):a[0])!="@"||r()!=":")&&k();c[a.slice(1)]=E(r())}return c}k()}return a},H=function(a,b,e){e=G(a,b,e);e===s?delete a[b]:a[b]=e},G=function(a,b,e){var g=a[b],f;if(typeof g=="object"&&g)if(o.call(g)=="[object Array]")for(f=g.length;f--;)H(g,f,e);else y(g,function(a){H(g,a,e)});return e.call(a,b,g)};p.parse=function(a,c){var e,g;b=0;C=""+a;e=E(r());r()!="$"&&k();b=C=w;return c&&o.call(c)=="[object Function]"?G((g={},g[""]=e,g),"",c):e}}}J&&define(function(){return p})})(this);
}());
