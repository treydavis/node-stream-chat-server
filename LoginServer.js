var util = require('util');
var Writable = require('stream').Writable;
util.inherits(LoginServer, Writable);

function LoginServer(user, users) {
    if (!(this instanceof LoginServer))
	return new LoginServer(user, users);

    Writable.call(this, {decodeStrings: false});

    this.user = user;
    this.users = users;
    user.sendLine('Welcome to Trey\'s chat server');
    user.sendLine('Login Name?');
}

LoginServer.prototype.isUserNameAvailable = function(userName) {
    return !this.users[userName];
};

LoginServer.prototype.isValidUserName = function(userName) {
    return userName.match(new RegExp(/^\w+$/)) != null;
}

LoginServer.prototype._write = function(line, encoding, done) {
    if(!this.isUserNameAvailable(line)) {
	this.user.sendLine('Sorry, name taken.');
	return;
    }
    if(!this.isValidUserName(line)) {
	this.user.sendLine('User name not accepted.');
	return;
    }
    this.user.name = line;
    this.users[line] = this.user;
    this.emit('login');
    done();
};

module.exports = LoginServer;
