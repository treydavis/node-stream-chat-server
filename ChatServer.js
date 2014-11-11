var util = require('util');
var Writable = require('stream').Writable;
util.inherits(ChatServer, Writable);

function ChatServer(user, users, rooms) {
    if (!(this instanceof ChatServer))
	return new ChatServer(user, sharedCache);

    Writable.call(this);
    this._writableState.objectMode = true;

    var isValidRoomName = function(roomName) {
	return roomName.match(new RegExp(/^\w+$/)) != null;
    };

    var sendLineToRoom = function(roomName, line) {
	if (!rooms[roomName]) return;
	rooms[roomName].forEach(function(occupant) {
	    occupant.sendLine(line);
	});
    };

    var roomRemoveOccupant = function(roomName, occupant) {
	if (!rooms[roomName]) return false;
	var i = rooms[roomName].indexOf(user);
	if (i == -1) return false;
	rooms[roomName].splice(i, 1);
	if (rooms[roomName].length == 0) delete rooms[roomName];
	return true;
    };

    var userLeaveRoom = function() {
	var roomName = user.room;
	user.room = null;

	if(roomRemoveOccupant(roomName, user)) {
	    var leaveLine = '* user has left chat: ' + user.name;
	    user.sendLine(leaveLine + ' (** this is you)');
	    sendLineToRoom(roomName, leaveLine);
	}
    };

    this.on('say', function(message) {
	var roomName = user.room;
	if (!rooms[roomName]) {
	    userLeaveRoom();
	    return;
	}
	sendLineToRoom(roomName, user.name + ': ' + message);
    });

    this.on('rooms', function() {
	user.sendLine('Active rooms are:');
	for (var roomName in rooms) {
	    var occupants = rooms[roomName];
	    user.sendLine(' * ' + roomName + ' (' + occupants.length + ')');
	}
	user.sendLine('end of list.');
    });

    this.on('join', function(roomName) {
	if(!isValidRoomName(roomName)) {
	    user.sendLine('Room name not accepted');
	    return;
	}

	userLeaveRoom();

	sendLineToRoom(roomName, ' * new user joined chat: ' + user.name);

	if (!rooms[roomName]) {
	    //create room
	    rooms[roomName] = [];
	}
	rooms[roomName].push(user);
	user.room = roomName;

	//send room enter
	user.sendLine('entering room: ' + roomName);
	rooms[roomName].forEach(function(occupant) {
	    var selfMark = occupant == user ? ' (** this is you)' : '';
	    user.sendLine(' * ' + occupant.name + selfMark);
	});
	user.sendLine('end of list.');
    });

    this.on('leave', function() {
	userLeaveRoom();
    });

    this.on('quit', function() {
	userLeaveRoom();
	//this.users.removeUser(user);
	socket.end('BYE\n');
    });

}

ChatServer.prototype._write = function(command, encoding, done) {
    console.log('chatserver: ', command);
    this.emit(command.command, command.payload);
    done();
};

module.exports = ChatServer;
