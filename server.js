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
	console.log('logged in');
	lineParseStream.unpipe(loginServer);
	var commandParseStream = new CommandParseStream();
	var chatServer = new ChatServer(user, users, rooms);
	lineParseStream.pipe(commandParseStream).pipe(chatServer);
    });
/*


    var messageEmitter = new MessageEmitter();
    var loginServer = new LoginServer(user, sharedCache);

    messageEmitter.setSocket(socket
    socket.pipe(messageEmitter.pipe(loginServer));

    loginServer.didLogIn = function(user) {
	var commandEmitter = new CommandEmitter();
	var chatServer = new ChatServer(user, sharedCache);
	messageEmitter.pipe(commandEmitter.pipe(chatServer));
    };*/
});

server.listen(9399, function() {
    console.log('server bound');
});


/*
    //the server should subscribe to events directly
    var attachServer = function(server) {
	this.removeAllListeners('data');
	this.on('data', messageParser(server));
	this.removeAllListeners('end');
	socket.on('end', function() {
	    if (server.end) server.end();
	    console.log('server disconnected');
	});
    };*/
