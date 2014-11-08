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

    var commands = {
	'say': function(message) {
	    for (var i=0; i < sockets.length; i++)
		sockets[i].write(message + '\n');
	},
	'rooms': function() {
	    //Active rooms are:
	    //<=  * chat (5)
	    //<=  * hottub (2)
	    //<= end of list.
	    socket.write('you called rooms');
	},
	'join': function() {
	    //   user joining
	    //entering room: chat
	    //<=  * gc
	    //<=  * gc_reviewer (** this is you)
	    //<=  * foo
	    //<=  * user1
	    //<=  * user2
	    //<=  * y2kcrisis
	    //<= end of list.

	    //   others in room
	    //* new user joined chat: user7
	},
	'leave': function() {
	    // in room
	    //* user has left chat: gc_reviewer (** this is you)
	},
	'quit': function() {
	    socket.end('BYE\n');
	}
    };

    var didRecieveMessage = function(message) {
	var command = 'say';
	var commandPattern = new RegExp(/^\/(.*)\s(.*)$/);
	var commandPatternMatches = message.match(commandPattern);
	if (commandPatternMatches) {
	    var command = commandPatternMatches[1];
	    message = commandPatternMatches[2];
	}
	if (commands[command] == undefined) return;
	commands[command](message);
	console.log('command: ', command, 'message: ', message);
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
