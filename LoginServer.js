var util = require('util');
var Writable = require('stream').Writable;
var StringDecoder = require('string_decoder').StringDecoder;
util.inherits(LoginServer, Writable);

function LoginServer(user, users) {
    if (!(this instanceof LoginServer))
	return new LoginServer(user, users);

    Writable.call(this, {decodeStrings: false});

    this.user = user;
    this.users = users;
    this._decoder = new StringDecoder('utf8');
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
    var userName = this._decoder.write(line);
    if(!this.isUserNameAvailable(userName)) {
	this.user.sendLine('Sorry, name taken.');
	done();
	return;
    }
    if(!this.isValidUserName(userName)) {
	this.user.sendLine('User name not accepted.');
	done();
	return;
    }
    this.user.name = userName;
    this.users[userName] = this.user;
    this.user.sendLine('Welcome ' + userName + '!');
    this.emit('login');
    done();
};

module.exports = LoginServer;
