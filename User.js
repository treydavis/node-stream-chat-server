function User(socket) {
    if (!(this instanceof User))
	return new User(socket);

    this.socket = socket;
}

User.prototype.sendLine = function(line) {
    this.socket.write(line + '\r\n');
};

module.exports = User;
