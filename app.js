var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');
 
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var value = "Start typing here...<br><br><br> Created with <strong>Omnilaze</strong>.";

var m_players;
var i;
m_players = [];
i = 0;

io.sockets.on('connection', function (socket) {
      //INICIO - escribir tiempo real
  io.emit('update', value);
  socket.on('update', function(msg){
    value = msg;
    socket.broadcast.emit('update', value);
  });

    //FIN - escribir tiempo real
    console.log("New connection: " + socket);
    socket.on('client_connected', function(data) {
      data.id = socket.id;
      m_players[i] = data;
      i++;
      return io.sockets.emit("send_data", m_players);
    });
    socket.on('update_coords', function(pos) {
      var x, _ref;
      try {
        for (x = 0, _ref = m_players.length; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
          if (m_players[x].id === socket.id) {
            m_players[x].x = pos.x;
            m_players[x].y = pos.y;
            console.log("Client: " + socket.id);
            console.log("X: " + pos.x + ",  Y: " + pos.y);
            break;
          }
        }
      } catch (err) {
        console.log(err);
      }
      return io.sockets.emit("send_data", m_players);
    });
    return socket.on('disconnect', function() {
      var j, n, tmp;
      j = 0;
      n = 0;
      tmp = [];
      while (n < m_players.length) {
        if (m_players[j].id === socket.id) {
          n++;
          break;
        }
        if (n < m_players.length) {
          tmp[j] = m_players[n];
          j++;
          n++;
          break;
        }
      }
      m_players = tmp;
      i = j;
      return io.sockets.emit('send_data', m_players);
    });
});

http.listen(80);
