var net = require('net');

var messageSeparator = '\n';
var sockets = [];
var names = {};

var server = net.createServer(function(socket) {
    socket.setEncoding('utf8');
    console.log('server connected');
    socket.on('end', function() {
	console.log('server disconnected');
    });

    var didRecieveMessage = function(message) {
	var commandPattern = new RegExp(/^\/(.*)\s(.*)$/);
	var commandPatternMatches = message.match(commandPattern);
	if (commandPatternMatches) {
	    var command = commandPatternMatches[1];
	    message = commandPatternMatches[2];
	    console.log('command: ', command, 'message: ', message);
	}
	else {
	    for (var i=0; i < sockets.length; i++)
		sockets[i].write(message + '\n');
	}
    };

    var unparsedData = '';
    socket.on('data', function(data) {
	console.log('data event: ', data);
	unparsedData += data;
	var messageSeparatorIndex = unparsedData.indexOf(messageSeparator);
	var didFindMessage = messageSeparatorIndex != -1;

	if (didFindMessage) {
            var message = unparsedData.slice(0, messageSeparatorIndex);
	    unparsedData = unparsedData.slice(messageSeparatorIndex + 1);
	    didRecieveMessage(message);
	}
    });
    socket.write('Welcome to Trey\'s chat server\r\n');
    sockets.push(socket);
});

server.listen(9399, function() {
    console.log('server bound');
});
