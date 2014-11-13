var net = require('net');
var User = require('./User.js');
var LineParseStream = require('./LineParseStream.js');
var LoginServer = require('./LoginServer.js');
var CommandParseStream = require('./CommandParseStream.js');
var ChatServer = require('./ChatServer.js');

var users = {};
var rooms = {};

var server = net.createServer(function(socket) {
    socket.setEncoding('utf8');
    console.log('server connected');

    var user = new User(socket);
    var lineParseStream = new LineParseStream();
    var loginServer = new LoginServer(user, users);
    socket.pipe(lineParseStream).pipe(loginServer);

    loginServer.on('login', function() {
	lineParseStream.unpipe(loginServer);
	var commandParseStream = new CommandParseStream();
	var chatServer = new ChatServer(user, users, rooms);
	lineParseStream.pipe(commandParseStream).pipe(chatServer);
	socket.on('close', function() {
	    chatServer.emit('quit');
	});
    });

});

server.listen(9399, function() {
    console.log('server bound');
});
