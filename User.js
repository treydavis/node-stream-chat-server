function User(socket) {
    if (!(this instanceof User))
	return new User(socket);

    this.socket = socket;
}

User.prototype.sendLine = function(line) {
    try {
	this.socket.write(line + '\r\n');
    } catch (e) {
	console.log('write to socket failed');
    }
};

module.exports = User;
