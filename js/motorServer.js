//Initializing libraries for Johnny-Five
var five = require("johnny-five");
var board = new five.Board();

//Initializing libraries for Socket.io
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

http.listen(3000, function(){
  console.log('motor server listening on *:3000');
});

board.on("ready", function() {
    
  motor = new five.Motor({
    pins: [8, 9, 10],
    controller: "PCA9685",
    address: 0x60
  });
  board.repl.inject({
    motor: motor,
  });

 io.on('connection', function (socket) {
     console.log('Connected to local webmoti page');
      socket.on('left', function () {
        console.log('Moving motor left');
        motor.forward(50);
    });
     socket.on('right', function () {
      console.log('Moving motor right');
      motor.reverse(50);
     
     
    });
     socket.on('stop', function () {
      console.log('stop');
      motor.stop();
     
     
    });
    
  }); 



});
